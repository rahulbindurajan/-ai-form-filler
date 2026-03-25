import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type PaymentFormData, type FormField, defaultForm } from '../types/form';

interface FormContextType {
  formData: PaymentFormData;
  aiFilledFields: Set<FormField>;
  setField: (field: FormField, value: string, fromAI?: boolean) => void;
  fillForm: (data: Partial<PaymentFormData>) => void;
  resetForm: () => void;
}

const FormContext = createContext<FormContextType>(null!);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<PaymentFormData>(() => {
    try {
      const saved = localStorage.getItem('ai-form-filler-data');
      return saved ? { ...defaultForm, ...JSON.parse(saved) } : defaultForm;
    } catch {
      return defaultForm;
    }
  });

  const [aiFilledFields, setAiFilledFields] = useState<Set<FormField>>(new Set());

  useEffect(() => {
    localStorage.setItem('ai-form-filler-data', JSON.stringify(formData));
  }, [formData]);

  const setField = (field: FormField, value: string, fromAI = false) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fromAI) {
      setAiFilledFields(prev => new Set(prev).add(field));
    } else {
      setAiFilledFields(prev => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  };

  const fillForm = (data: Partial<PaymentFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    const keys = Object.keys(data) as FormField[];
    setAiFilledFields(prev => {
      const next = new Set(prev);
      keys.forEach(k => { if (data[k]) next.add(k); });
      return next;
    });
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setAiFilledFields(new Set());
    localStorage.removeItem('ai-form-filler-data');
  };

  return (
    <FormContext.Provider value={{ formData, aiFilledFields, setField, fillForm, resetForm }}>
      {children}
    </FormContext.Provider>
  );
}

export const useForm = () => useContext(FormContext);

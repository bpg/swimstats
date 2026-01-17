import { useState } from 'react';
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { MeetInput, Meet, CourseType } from '@/types/meet';
import { useCreateMeet, useUpdateMeet } from '@/hooks/useMeets';

export interface MeetFormProps {
  initialData?: Meet;
  onSuccess?: (meet: Meet) => void;
  onCancel?: () => void;
}

export function MeetForm({ initialData, onSuccess, onCancel }: MeetFormProps) {
  const [formData, setFormData] = useState<MeetInput>({
    name: initialData?.name || '',
    city: initialData?.city || '',
    country: initialData?.country || 'Canada',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    course_type: initialData?.course_type || '25m',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MeetInput, string>>>({});

  const createMutation = useCreateMeet();
  const updateMutation = useUpdateMeet();

  const isEditing = !!initialData;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof MeetInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Meet name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (formData.city.length > 255) {
      newErrors.city = 'City must be 255 characters or less';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let meet: Meet;
      if (isEditing) {
        meet = await updateMutation.mutateAsync({ id: initialData.id, input: formData });
      } else {
        meet = await createMutation.mutateAsync(formData);
      }
      onSuccess?.(meet);
    } catch (error: any) {
      setErrors({ name: error.message || 'Failed to save meet' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Meet' : 'Add New Meet'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Meet Name"
            name="name"
            placeholder="e.g., Ontario Championships 2026"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              placeholder="e.g., Toronto"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              error={errors.city}
              required
            />

            <Input
              label="Country"
              name="country"
              placeholder="e.g., Canada"
              value={formData.country || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              error={errors.date}
              required
            />

            <Select
              label="Course Type"
              name="course_type"
              value={formData.course_type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                course_type: e.target.value as CourseType 
              }))}
              options={[
                { value: '25m', label: '25m (Short Course)' },
                { value: '50m', label: '50m (Long Course)' },
              ]}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              isLoading={isPending}
            >
              {isEditing ? 'Save Changes' : 'Add Meet'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default MeetForm;

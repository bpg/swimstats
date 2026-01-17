import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading, ErrorBanner } from '@/components/ui';
import { MeetList, MeetForm } from '@/components/meets';
import { useCourseType } from '@/stores/courseFilterStore';
import { useMeet, useDeleteMeet } from '@/hooks/useMeets';
import { Meet } from '@/types/meet';

/**
 * Meets page - list and manage swim meets.
 */
export function Meets() {
  const courseType = useCourseType();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [showForm, setShowForm] = useState(false);
  const [editingMeet, setEditingMeet] = useState<Meet | null>(null);

  const selectedMeetId = searchParams.get('id');
  const { data: selectedMeet, isLoading: meetLoading } = useMeet(selectedMeetId || '');
  const deleteMutation = useDeleteMeet();

  const handleSelectMeet = (meet: Meet) => {
    setSearchParams({ id: meet.id });
  };

  const handleEditMeet = () => {
    if (selectedMeet) {
      setEditingMeet(selectedMeet);
      setShowForm(true);
    }
  };

  const handleDeleteMeet = async () => {
    if (selectedMeet && window.confirm(`Delete "${selectedMeet.name}"? This will also delete all times from this meet.`)) {
      await deleteMutation.mutateAsync(selectedMeet.id);
      setSearchParams({});
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMeet(null);
    // Refresh the selected meet if we were editing
    if (editingMeet && selectedMeetId) {
      setSearchParams({ id: editingMeet.id });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMeet(null);
  };

  // Show form for adding/editing
  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <MeetForm
          initialData={editingMeet || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meets</h1>
          <p className="text-slate-600 mt-1">
            Manage your swim competitions and time trials.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Meet
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meet List */}
        <MeetList
          courseType={courseType}
          limit={50}
          onSelectMeet={handleSelectMeet}
          emptyMessage="No meets yet. Click 'Add Meet' to get started!"
        />

        {/* Selected Meet Details */}
        <Card>
          <CardHeader>
            <CardTitle>Meet Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedMeetId ? (
              <div className="text-center py-8 text-slate-500">
                <svg
                  className="mx-auto h-12 w-12 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-4">Select a meet to view details</p>
              </div>
            ) : meetLoading ? (
              <Loading className="py-8" />
            ) : selectedMeet ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedMeet.name}</h3>
                  <p className="text-slate-600">{selectedMeet.city}, {selectedMeet.country}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Date</p>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedMeet.date).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Course Type</p>
                    <p className="font-medium text-slate-900">
                      {selectedMeet.course_type === '25m' ? '25m (Short Course)' : '50m (Long Course)'}
                    </p>
                  </div>
                  {selectedMeet.time_count !== undefined && (
                    <div>
                      <p className="text-slate-500">Times Recorded</p>
                      <p className="font-medium text-slate-900">
                        {selectedMeet.time_count} time{selectedMeet.time_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/add-times?meet_id=${selectedMeet.id}`)}
                  >
                    Add Times
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEditMeet}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleDeleteMeet}
                    isLoading={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <ErrorBanner message="Meet not found" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Meets;

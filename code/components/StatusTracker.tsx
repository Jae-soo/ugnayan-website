'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { storage } from '@/lib/storage';
import type { Complaint, DocumentRequest } from '@/lib/types';

export function StatusTracker(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<{
    complaints: Complaint[];
    documents: DocumentRequest[];
  } | null>(null);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    const submissions = storage.getUserSubmissions(email);
    
    if (submissions.complaints.length === 0 && submissions.documents.length === 0) {
      toast.error('No submissions found for this email address');
      setResults(null);
      return;
    }

    setResults(submissions);
    toast.success('Submissions retrieved successfully');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
      case 'processing':
        return 'bg-blue-500';
      case 'resolved':
      case 'completed':
        return 'bg-green-500';
      case 'ready_for_pickup':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatStatus = (status: string): string => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Track Your Submissions</CardTitle>
        <CardDescription>Enter your email to view the status of your complaints and document requests</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="track-email">Email Address</Label>
            <Input
              id="track-email"
              type="email"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="juan@example.com"
            />
          </div>
          <Button type="submit" className="w-full">
            Track Submissions
          </Button>
        </form>

        {results && (
          <div className="space-y-6">
            {results.complaints.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Complaints</h3>
                <div className="space-y-3">
                  {results.complaints.map((complaint: Complaint) => (
                    <Card key={complaint.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Reference ID: {complaint.id}</p>
                            <p className="text-sm text-gray-600">{formatDate(complaint.submittedAt)}</p>
                          </div>
                          <Badge className={getStatusColor(complaint.status)}>
                            {formatStatus(complaint.status)}
                          </Badge>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Type:</span> {formatStatus(complaint.complaintType)}</p>
                          <p><span className="font-medium">Description:</span> {complaint.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {results.documents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Document Requests</h3>
                <div className="space-y-3">
                  {results.documents.map((doc: DocumentRequest) => (
                    <Card key={doc.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Reference ID: {doc.id}</p>
                            <p className="text-sm text-gray-600">{formatDate(doc.submittedAt)}</p>
                          </div>
                          <Badge className={getStatusColor(doc.status)}>
                            {formatStatus(doc.status)}
                          </Badge>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Document:</span> {formatStatus(doc.documentType)}</p>
                          <p><span className="font-medium">Purpose:</span> {doc.purpose}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

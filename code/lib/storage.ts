import type { Complaint, DocumentRequest, ServiceRequest, Report, Reply } from './types';

const COMPLAINTS_KEY = 'barangay_complaints';
const DOCUMENTS_KEY = 'barangay_documents';
const SERVICE_REQUESTS_KEY = 'barangay_service_requests';
const REPORTS_KEY = 'barangay_reports';
const REPLIES_KEY = 'barangay_replies';
const SYNC_MAP_KEY = 'barangay_sync_map';

export const storage = {
  getComplaints: (): Complaint[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(COMPLAINTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveComplaint: (complaint: Complaint): void => {
    if (typeof window === 'undefined') return;
    const complaints = storage.getComplaints();
    complaints.push(complaint);
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
  },

  getDocumentRequests: (): DocumentRequest[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(DOCUMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveDocumentRequest: (request: DocumentRequest): void => {
    if (typeof window === 'undefined') return;
    const requests = storage.getDocumentRequests();
    requests.push(request);
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(requests));
  },

  getUserSubmissions: (email: string): { complaints: Complaint[]; documents: DocumentRequest[] } => {
    const complaints = storage.getComplaints().filter((c: Complaint) => c.email === email);
    const documents = storage.getDocumentRequests().filter((d: DocumentRequest) => d.email === email);
    return { complaints, documents };
  },
};

// Service requests and reports
export const getServiceRequests = (): ServiceRequest[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SERVICE_REQUESTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveServiceRequest = (request: ServiceRequest): void => {
  if (typeof window === 'undefined') return;
  const requests = getServiceRequests();
  requests.push(request);
  localStorage.setItem(SERVICE_REQUESTS_KEY, JSON.stringify(requests));
};

export const updateServiceRequestStatus = (referenceId: string, status: string): void => {
  if (typeof window === 'undefined') return;
  const requests = getServiceRequests();
  const updated = requests.map((req) =>
    req.referenceId === referenceId ? { ...req, status } : req
  );
  localStorage.setItem(SERVICE_REQUESTS_KEY, JSON.stringify(updated));
};

export const getReports = (): Report[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(REPORTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveReport = (report: Report): void => {
  if (typeof window === 'undefined') return;
  const reports = getReports();
  reports.push(report);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
};

export const updateReportStatus = (referenceId: string, status: string): void => {
  if (typeof window === 'undefined') return;
  const reports = getReports();
  const updated = reports.map((rep) =>
    rep.referenceId === referenceId ? { ...rep, status } : rep
  );
  localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
};

export const getSyncMap = (): Record<string, { type: 'service' | 'report'; serverId: string }> => {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(SYNC_MAP_KEY);
  return data ? JSON.parse(data) : {};
};

export const setSyncMapEntry = (referenceId: string, type: 'service' | 'report', serverId: string): void => {
  if (typeof window === 'undefined') return;
  const map = getSyncMap();
  map[referenceId] = { type, serverId };
  localStorage.setItem(SYNC_MAP_KEY, JSON.stringify(map));
};

export const getSyncServerId = (referenceId: string): string | undefined => {
  const map = getSyncMap();
  return map[referenceId]?.serverId;
};

export const removeSyncMapEntry = (referenceId: string): void => {
  if (typeof window === 'undefined') return;
  const map = getSyncMap();
  delete map[referenceId];
  localStorage.setItem(SYNC_MAP_KEY, JSON.stringify(map));
};

export const getUserServiceRequests = (email: string): ServiceRequest[] => {
  return getServiceRequests().filter((r) => r.email === email);
};

export const getUserReports = (email: string): Report[] => {
  return getReports().filter((r) => r.email === email);
};

export const updateDocumentRequestStatus = (id: string, status: string): void => {
  if (typeof window === 'undefined') return;
  const requests = storage.getDocumentRequests();
  const updated = requests.map((req) =>
    req.id === id ? { ...req, status } : req
  );
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(updated));
};

export const updateComplaintStatus = (id: string, status: string): void => {
  if (typeof window === 'undefined') return;
  const complaints = storage.getComplaints();
  const updated = complaints.map((complaint) =>
    complaint.id === id ? { ...complaint, status } : complaint
  );
  localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(updated));
};

// Replies system
export const getReplies = (): Reply[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(REPLIES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveReply = (reply: Reply): void => {
  if (typeof window === 'undefined') return;
  const replies = getReplies();
  replies.push(reply);
  localStorage.setItem(REPLIES_KEY, JSON.stringify(replies));
};

export const getRepliesForReference = (referenceId: string): Reply[] => {
  return getReplies().filter((r) => r.referenceId === referenceId);
};

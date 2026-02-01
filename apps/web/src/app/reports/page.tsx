'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';

interface Report {
  id: string;
  type: 'birth_chart' | 'matchmaking' | 'muhurat' | 'panchang' | 'horoscope';
  title: string;
  description: string;
  createdAt: string;
  format: 'pdf' | 'json';
  size: string;
  status: 'ready' | 'processing' | 'failed';
}

const reportTypeIcons: Record<string, string> = {
  birth_chart: '🌟',
  matchmaking: '💍',
  muhurat: '🕐',
  panchang: '📅',
  horoscope: '🔮',
};

const reportTypeLabels: Record<string, string> = {
  birth_chart: 'Birth Chart',
  matchmaking: 'Kundli Matching',
  muhurat: 'Muhurat',
  panchang: 'Panchang',
  horoscope: 'Horoscope',
};

const mockReports: Report[] = [
  {
    id: '1',
    type: 'birth_chart',
    title: 'My Birth Chart - Full Report',
    description: 'Complete birth chart analysis with planetary positions, aspects, and predictions',
    createdAt: '2024-01-20T10:30:00Z',
    format: 'pdf',
    size: '2.4 MB',
    status: 'ready',
  },
  {
    id: '2',
    type: 'matchmaking',
    title: 'Kundli Matching - John & Jane',
    description: 'Complete compatibility analysis with Ashtakoot and Dashakoot matching',
    createdAt: '2024-01-19T15:45:00Z',
    format: 'pdf',
    size: '1.8 MB',
    status: 'ready',
  },
  {
    id: '3',
    type: 'muhurat',
    title: 'Griha Pravesh Muhurat - Feb 2024',
    description: 'Auspicious dates for house warming ceremony in February 2024',
    createdAt: '2024-01-18T09:15:00Z',
    format: 'pdf',
    size: '856 KB',
    status: 'ready',
  },
  {
    id: '4',
    type: 'birth_chart',
    title: 'Father - Birth Chart',
    description: 'Basic birth chart with Rashi and Navamsa',
    createdAt: '2024-01-17T14:20:00Z',
    format: 'pdf',
    size: '1.2 MB',
    status: 'ready',
  },
  {
    id: '5',
    type: 'panchang',
    title: 'January 2024 Panchang',
    description: 'Monthly panchang for January 2024',
    createdAt: '2024-01-01T00:00:00Z',
    format: 'pdf',
    size: '3.1 MB',
    status: 'ready',
  },
  {
    id: '6',
    type: 'horoscope',
    title: 'Annual Horoscope 2024 - Taurus',
    description: 'Detailed yearly predictions for Taurus moon sign',
    createdAt: '2023-12-28T11:30:00Z',
    format: 'pdf',
    size: '1.5 MB',
    status: 'ready',
  },
  {
    id: '7',
    type: 'birth_chart',
    title: 'Chart Export',
    description: 'Birth chart data export',
    createdAt: '2024-01-15T16:00:00Z',
    format: 'json',
    size: '45 KB',
    status: 'ready',
  },
  {
    id: '8',
    type: 'matchmaking',
    title: 'Compatibility Analysis - Processing',
    description: 'Detailed compatibility report with dasha analysis',
    createdAt: '2024-01-20T12:00:00Z',
    format: 'pdf',
    size: '--',
    status: 'processing',
  },
];

const filterOptions = [
  { value: 'all', label: 'All Reports' },
  { value: 'birth_chart', label: 'Birth Charts' },
  { value: 'matchmaking', label: 'Kundli Matching' },
  { value: 'muhurat', label: 'Muhurat' },
  { value: 'panchang', label: 'Panchang' },
  { value: 'horoscope', label: 'Horoscope' },
];

export default function ReportsPage() {
  const [reports] = useState<Report[]>(mockReports);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const filteredReports = reports
    .filter((report) => filter === 'all' || report.type === filter)
    .filter((report) => 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  const toggleReportSelection = (id: string) => {
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map((r) => r.id));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = (report: Report) => {
    // Simulate download
    console.log('Downloading:', report.title);
    alert(`Downloading ${report.title}...`);
  };

  const handleBulkDownload = () => {
    const selected = reports.filter((r) => selectedReports.includes(r.id));
    console.log('Bulk downloading:', selected);
    alert(`Downloading ${selected.length} reports...`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      console.log('Deleting:', id);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen py-8 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                My Reports
              </h1>
              <p className="mt-1 text-muted-foreground">
                View and download your generated astrology reports
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {filteredReports.length} reports
              </span>
              {selectedReports.length > 0 && (
                <button
                  onClick={handleBulkDownload}
                  className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Download ({selectedReports.length})
                </button>
              )}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="card-vedic p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Filter by Type */}
              <div className="flex gap-2 flex-wrap">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={cn(
                      'px-3 py-2 text-sm rounded-lg transition-colors',
                      filter === option.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Reports List */}
          {filteredReports.length > 0 ? (
            <div className="card-vedic overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border">
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === filteredReports.length}
                    onChange={selectAll}
                    className="w-4 h-4 rounded border-border"
                  />
                </div>
                <div className="col-span-5">Report</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className={cn(
                      'p-4 hover:bg-muted/30 transition-colors',
                      selectedReports.includes(report.id) && 'bg-primary-50 dark:bg-primary-950'
                    )}
                  >
                    <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                      {/* Checkbox */}
                      <div className="hidden md:flex col-span-1 items-center">
                        <input
                          type="checkbox"
                          checked={selectedReports.includes(report.id)}
                          onChange={() => toggleReportSelection(report.id)}
                          className="w-4 h-4 rounded border-border"
                        />
                      </div>

                      {/* Report Info */}
                      <div className="col-span-5 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                          {reportTypeIcons[report.type]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {report.title}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {report.description}
                          </p>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="hidden md:block col-span-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs">
                          {reportTypeLabels[report.type]}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="hidden md:block col-span-2 text-sm text-muted-foreground">
                        {formatDate(report.createdAt)}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2 mt-3 md:mt-0">
                        {report.status === 'ready' ? (
                          <>
                            <button
                              onClick={() => handleDownload(report)}
                              className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              Download {report.format.toUpperCase()}
                            </button>
                            <button
                              onClick={() => handleDelete(report.id)}
                              className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </>
                        ) : report.status === 'processing' ? (
                          <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          <span className="text-xs text-red-600">Failed</span>
                        )}
                      </div>
                    </div>

                    {/* Mobile Meta */}
                    <div className="flex items-center gap-3 mt-3 md:hidden text-xs text-muted-foreground">
                      <span>{reportTypeLabels[report.type]}</span>
                      <span>•</span>
                      <span>{formatDate(report.createdAt)}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card-vedic p-12 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : "You haven't generated any reports yet"}
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/chart"
                  className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Generate Birth Chart
                </Link>
                <Link
                  href="/matchmaking"
                  className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Kundli Matching
                </Link>
              </div>
            </div>
          )}

          {/* Storage Info */}
          <div className="mt-6 card-vedic p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-foreground">Storage Used</h3>
                <p className="text-xs text-muted-foreground">
                  12.5 MB of 100 MB used
                </p>
              </div>
              <div className="flex-1 max-w-md">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '12.5%' }} />
                </div>
              </div>
              <Link
                href="/profile?tab=billing"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline shrink-0"
              >
                Upgrade for more storage →
              </Link>
            </div>
          </div>

          {/* Quick Generate */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/chart"
              className="card-vedic p-4 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">🌟</span>
                <div>
                  <h4 className="font-medium text-foreground">Birth Chart</h4>
                  <p className="text-xs text-muted-foreground">Generate new chart</p>
                </div>
              </div>
            </Link>
            <Link
              href="/matchmaking"
              className="card-vedic p-4 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">💍</span>
                <div>
                  <h4 className="font-medium text-foreground">Kundli Match</h4>
                  <p className="text-xs text-muted-foreground">Check compatibility</p>
                </div>
              </div>
            </Link>
            <Link
              href="/muhurat"
              className="card-vedic p-4 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">🕐</span>
                <div>
                  <h4 className="font-medium text-foreground">Find Muhurat</h4>
                  <p className="text-xs text-muted-foreground">Auspicious times</p>
                </div>
              </div>
            </Link>
            <Link
              href="/panchang"
              className="card-vedic p-4 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">📅</span>
                <div>
                  <h4 className="font-medium text-foreground">Panchang</h4>
                  <p className="text-xs text-muted-foreground">Daily calendar</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

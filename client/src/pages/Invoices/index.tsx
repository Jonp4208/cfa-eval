import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  FileText,
  Plus,
  Send,
  DollarSign,
  Trash2,
  Edit,
  Eye,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import invoiceService, { Invoice } from '@/services/invoiceService';
import { format } from 'date-fns';
import CreateInvoiceForm from './components/CreateInvoiceForm';
import InvoiceDetails from './components/InvoiceDetails';
import PageHeader, { headerButtonClass } from '@/components/PageHeader';

export default function InvoicesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

  // Check if user is Jonathon Pope (only user with access to invoices)
  const isJonathonPope = user?.email === 'jonp4208@gmail.com';

  // Fetch invoices
  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['invoices', selectedTab],
    queryFn: async () => {
      const filter = selectedTab !== 'all' ? { status: selectedTab } : undefined;
      return invoiceService.getAllInvoices(filter);
    },
    enabled: isJonathonPope // Only fetch if user is Jonathon Pope
  });

  // Send invoice mutation
  const sendInvoiceMutation = useMutation({
    mutationFn: (invoiceId: string) => invoiceService.sendInvoice(invoiceId),
    onSuccess: (data) => {
      if (data.emailSent) {
        toast({
          title: 'Invoice Sent',
          description: 'The invoice has been marked as sent and email was sent successfully.',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Invoice Marked as Sent',
          description: 'The invoice has been marked as sent, but the email could not be sent. Please check your email configuration.',
          variant: 'warning'
        });
      }
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to send invoice: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Mark as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: (invoiceId: string) => invoiceService.markAsPaid(invoiceId),
    onSuccess: () => {
      toast({
        title: 'Invoice Updated',
        description: 'The invoice has been marked as paid.',
        variant: 'default'
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update invoice: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: (invoiceId: string) => invoiceService.deleteInvoice(invoiceId),
    onSuccess: () => {
      toast({
        title: 'Invoice Deleted',
        description: 'The invoice has been deleted.',
        variant: 'default'
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete invoice: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Handle invoice creation success
  const handleInvoiceCreated = () => {
    setShowCreateForm(false);
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    toast({
      title: 'Invoice Created',
      description: 'The invoice has been created successfully.',
      variant: 'default'
    });
  };

  // Handle view invoice details
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  // Handle send invoice
  const handleSendInvoice = (invoiceId: string) => {
    if (confirm('Are you sure you want to send this invoice? This cannot be undone.')) {
      sendInvoiceMutation.mutate(invoiceId);
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = (invoiceId: string) => {
    if (confirm('Are you sure you want to mark this invoice as paid?')) {
      markAsPaidMutation.mutate(invoiceId);
    }
  };

  // Handle delete invoice
  const handleDeleteInvoice = (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice? This cannot be undone.')) {
      deleteInvoiceMutation.mutate(invoiceId);
    }
  };

  // If user is not Jonathon Pope, show access denied
  if (!isJonathonPope) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
              <p className="mt-2">This page is restricted to authorized personnel only.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const totalInvoices = invoices?.length || 0;
  const pendingInvoices = invoices?.filter(invoice => invoice.status === 'pending').length || 0;
  const paidInvoices = invoices?.filter(invoice => invoice.status === 'paid').length || 0;
  const overdueInvoices = invoices?.filter(invoice => {
    if (invoice.status !== 'pending') return false;
    const dueDate = new Date(invoice.dueDate);
    return dueDate < new Date();
  }).length || 0;
  const totalRevenue = invoices?.filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0) || 0;
  const pendingRevenue = invoices?.filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + invoice.total, 0) || 0;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Use PageHeader component */}
        <PageHeader
          title="Invoice Management"
          subtitle="Create and manage invoices for all stores"
          icon={<FileText className="h-5 w-5" />}
          showBackButton={true}
          actions={
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <Button
                className={headerButtonClass}
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <Button
                className={headerButtonClass}
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Create Invoice</span>
              </Button>
            </div>
          }
        />

        {/* Invoice Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-blue-700">{totalInvoices}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700">{pendingInvoices}</p>
                  <p className="text-xs text-yellow-600">${pendingRevenue.toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Paid</p>
                  <p className="text-2xl font-bold text-green-700">{paidInvoices}</p>
                  <p className="text-xs text-green-600">${totalRevenue.toLocaleString()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-700">{overdueInvoices}</p>
                  <p className="text-xs text-red-600">Needs attention</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Invoices</CardTitle>
          </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="flex flex-wrap mb-4 w-full">
              <TabsTrigger value="all" className="flex-1 min-w-[80px]">All</TabsTrigger>
              <TabsTrigger value="draft" className="flex-1 min-w-[80px]">Draft</TabsTrigger>
              <TabsTrigger value="sent" className="flex-1 min-w-[80px]">Sent</TabsTrigger>
              <TabsTrigger value="paid" className="flex-1 min-w-[80px]">Paid</TabsTrigger>
              <TabsTrigger value="overdue" className="flex-1 min-w-[80px]">Overdue</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-0">
              {isLoading ? (
                <div className="text-center py-4">Loading invoices...</div>
              ) : invoices && invoices.length > 0 ? (
                <>
                  {/* Desktop view - Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left p-2">Invoice #</th>
                          <th className="text-left p-2">Client</th>
                          <th className="text-left p-2">Issue Date</th>
                          <th className="text-left p-2">Due Date</th>
                          <th className="text-right p-2">Amount</th>
                          <th className="text-center p-2">Status</th>
                          <th className="text-right p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice: Invoice) => (
                          <tr key={invoice._id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{invoice.invoiceNumber}</td>
                            <td className="p-2">{invoice.client.name}</td>
                            <td className="p-2">
                              {invoice.issueDate ? format(new Date(invoice.issueDate), 'MMM d, yyyy') : 'N/A'}
                            </td>
                            <td className="p-2">
                              {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}
                            </td>
                            <td className="p-2 text-right">${invoice.total.toFixed(2)}</td>
                            <td className="p-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                invoice.status === 'draft' ? 'bg-gray-200 text-gray-800' :
                                invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {invoice.status}
                              </span>
                            </td>
                            <td className="p-2 text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewInvoice(invoice)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>

                                {invoice.status === 'draft' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleSendInvoice(invoice._id!)}
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteInvoice(invoice._id!)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}

                                {invoice.status === 'sent' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMarkAsPaid(invoice._id!)}
                                  >
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile view - Cards */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {invoices.map((invoice: Invoice) => (
                      <div key={invoice._id} className="bg-card border rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">Invoice #{invoice.invoiceNumber}</h3>
                            <p className="text-sm text-muted-foreground">{invoice.client.name}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'draft' ? 'bg-gray-200 text-gray-800' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Issue Date:</span><br />
                            {invoice.issueDate ? format(new Date(invoice.issueDate), 'MMM d, yyyy') : 'N/A'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Due Date:</span><br />
                            {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-muted-foreground">Amount:</span>
                          <span className="font-semibold">${invoice.total.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-end space-x-1 border-t pt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>

                          {invoice.status === 'draft' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendInvoice(invoice._id!)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteInvoice(invoice._id!)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </>
                          )}

                          {invoice.status === 'sent' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice._id!)}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No invoices found. Create your first invoice to get started.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Invoice Form Dialog */}
      {showCreateForm && (
        <CreateInvoiceForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onSuccess={handleInvoiceCreated}
        />
      )}

      {/* Invoice Details Dialog */}
      {showInvoiceDetails && selectedInvoice && (
        <InvoiceDetails
          open={showInvoiceDetails}
          onOpenChange={setShowInvoiceDetails}
          invoice={selectedInvoice}
          onSend={handleSendInvoice}
          onMarkAsPaid={handleMarkAsPaid}
          onDelete={handleDeleteInvoice}
        />
      )}
      </div>
    </div>
  );
}

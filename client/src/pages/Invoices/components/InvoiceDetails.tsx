import React from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Send,
  DollarSign,
  Trash2,
  Printer,
  Download,
  Calendar,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Invoice } from '@/services/invoiceService';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface InvoiceDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onSend: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function InvoiceDetails({
  open,
  onOpenChange,
  invoice,
  onSend,
  onMarkAsPaid,
  onDelete
}: InvoiceDetailsProps) {
  // Format dates
  const formatDate = (date: Date | string) => {
    return date ? format(new Date(date), 'MMMM d, yyyy') : 'N/A';
  };

  // Print invoice
  const handlePrint = () => {
    const printContent = document.getElementById('invoice-print-content');
    const originalContents = document.body.innerHTML;

    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>Invoice #{invoice.invoiceNumber}</span>
            <Badge className={`
              ${invoice.status === 'draft' ? 'bg-gray-200 text-gray-800' :
                invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {invoice.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div id="invoice-print-content" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
              <p className="text-muted-foreground">#{invoice.invoiceNumber}</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Issue Date: {formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Due Date: {formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Client and Billing Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p className="font-medium">{invoice.client.name}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                {invoice.client.address?.street && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{invoice.client.address.street}</span>
                  </div>
                )}
                {(invoice.client.address?.city || invoice.client.address?.state || invoice.client.address?.zipCode) && (
                  <div className="flex items-center gap-2">
                    <span className="ml-5">
                      {[
                        invoice.client.address?.city,
                        invoice.client.address?.state,
                        invoice.client.address?.zipCode
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {invoice.client.address?.country && (
                  <div className="flex items-center gap-2">
                    <span className="ml-5">{invoice.client.address.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{invoice.client.email}</span>
                </div>
                {invoice.client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{invoice.client.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Payment Details:</h3>
              <p className="capitalize text-sm">
                Method: {invoice.paymentMethod?.replace('_', ' ')}
              </p>
              {invoice.paymentMethod === 'bank_transfer' && invoice.paymentDetails && (
                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                  {invoice.paymentDetails.bankName && (
                    <p>Bank: {invoice.paymentDetails.bankName}</p>
                  )}
                  {invoice.paymentDetails.accountName && (
                    <p>Account Name: {invoice.paymentDetails.accountName}</p>
                  )}
                  {invoice.paymentDetails.accountNumber && (
                    <p>Account Number: {invoice.paymentDetails.accountNumber}</p>
                  )}
                  {invoice.paymentDetails.routingNumber && (
                    <p>Routing Number: {invoice.paymentDetails.routingNumber}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <h3 className="font-semibold mb-2">Invoice Items:</h3>

            {/* Desktop view - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-sm">
                    <th className="text-left p-2 border">Description</th>
                    <th className="text-center p-2 border">Quantity</th>
                    <th className="text-right p-2 border">Unit Price</th>
                    <th className="text-right p-2 border">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 border">{item.description}</td>
                      <td className="p-2 text-center border">{item.quantity}</td>
                      <td className="p-2 text-right border">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right border">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="p-2 text-right font-medium border">Subtotal:</td>
                    <td className="p-2 text-right border">${invoice.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-2 text-right font-medium border">
                      Tax ({invoice.taxRate}%):
                    </td>
                    <td className="p-2 text-right border">${invoice.taxAmount.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-muted">
                    <td colSpan={3} className="p-2 text-right font-bold border">Total:</td>
                    <td className="p-2 text-right font-bold border">${invoice.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile view - Cards */}
            <div className="md:hidden space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {invoice.items.map((item, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="font-medium mb-1">{item.description}</div>
                    <div className="grid grid-cols-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Qty:</span> {item.quantity}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price:</span> ${item.unitPrice.toFixed(2)}
                      </div>
                      <div className="text-right font-medium">
                        ${item.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border rounded-md p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({invoice.taxRate}%):</span>
                  <span>${invoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {invoice.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notes:</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}

            {invoice.terms && (
              <div>
                <h3 className="font-semibold mb-2">Terms & Conditions:</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.terms}</p>
              </div>
            )}
          </div>

          {/* Status Information */}
          {(invoice.sentAt || invoice.paidAt) && (
            <div className="bg-muted p-3 rounded-md">
              <h3 className="font-semibold mb-2">Status Information:</h3>
              <div className="text-sm space-y-1">
                {invoice.sentAt && (
                  <p>Sent on: {formatDate(invoice.sentAt)}</p>
                )}
                {invoice.paidAt && (
                  <p>Paid on: {formatDate(invoice.paidAt)}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:justify-end">
          <div className="flex w-full sm:w-auto justify-center sm:justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="w-full sm:w-auto"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-end">
            {invoice.status === 'draft' && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onSend(invoice._id!)}
                  className="flex-1 sm:flex-none"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(invoice._id!)}
                  className="flex-1 sm:flex-none"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}

            {invoice.status === 'sent' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onMarkAsPaid(invoice._id!)}
                className="flex-1 sm:flex-none"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

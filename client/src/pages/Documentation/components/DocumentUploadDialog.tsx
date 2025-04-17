import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import documentationService from '@/services/documentationService';
import api from '@/lib/axios';
import { Upload, Loader2 } from 'lucide-react';

interface Props {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}

export default function DocumentUploadDialog({ documentId, isOpen, onClose, onUpload }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('Administrative');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Auto-fill name with file name if not already set
      if (!name) {
        setName(selectedFile.name.split('.')[0]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error('Please enter a document name');
      return;
    }

    if (!type) {
      toast.error('Please select a document type');
      return;
    }

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);

      // Create a FormData object to upload the file
      const formData = new FormData();
      formData.append('file', file);

      // Upload the file
      const uploadResponse = await api.post('/api/users/upload', formData);
      const fileData = uploadResponse.data;

      // Add the document to the documentation record
      await documentationService.addDocumentAttachment(documentId, {
        name,
        type,
        category,
        url: fileData.url
      });

      toast.success('Document uploaded successfully');
      onUpload();
      onClose();

      // Reset form
      setName('');
      setType('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to upload document');
      console.error('Error uploading document:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document or file related to this record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[#27251F]/60">
              Document Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#27251F]/60">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Disciplinary">Disciplinary</SelectItem>
                <SelectItem value="Administrative">Administrative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#27251F]/60">
              Document Type
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {category === 'Disciplinary' ? (
                  <>
                    <SelectItem value="Verbal Warning">Verbal Warning</SelectItem>
                    <SelectItem value="Written Warning">Written Warning</SelectItem>
                    <SelectItem value="Final Warning">Final Warning</SelectItem>
                    <SelectItem value="Suspension">Suspension</SelectItem>
                    <SelectItem value="Termination">Termination</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Call Out">Call Out</SelectItem>
                    <SelectItem value="Doctor Note">Doctor Note</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#27251F]/60">
              File
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                {file ? file.name : 'Select File'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, Word, Images
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !type || !file || loading}
            className="bg-[#E51636] hover:bg-[#E51636]/90 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Share2, 
  Copy, 
  Eye, 
  Lock, 
  Unlock,
  Link,
  QrCode,
  Download,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface ResumeSharingProps {
  resumeId: string;
  resumeTitle: string;
  onShareCreated?: (shareData: any) => void;
}

interface ShareData {
  id: string;
  url: string;
  password?: string;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  expiresAt?: string;
}

export function ResumeSharing({ resumeId, resumeTitle, onShareCreated }: ResumeSharingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    isPublic: true,
    password: '',
    expiresIn: 'never', // 'never', '1day', '7days', '30days'
    allowDownload: true,
    allowComments: false
  });

  const createShareLink = async () => {
    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/resumes/sharing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeId,
          ...shareSettings
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShareData(data);
        onShareCreated?.(data);
        toast.success('Share link created successfully!');
      } else {
        toast.error('Failed to create share link');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Error creating share link');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const generateQRCode = () => {
    if (shareData) {
      // In a real app, you'd generate a QR code here
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareData.url)}`;
      window.open(qrUrl, '_blank');
    }
  };

  const getExpirationText = (expiresIn: string) => {
    switch (expiresIn) {
      case '1day': return '1 day';
      case '7days': return '7 days';
      case '30days': return '30 days';
      default: return 'Never';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share Resume
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Resume: {resumeTitle}
          </DialogTitle>
        </DialogHeader>

        {!shareData ? (
          <div className="space-y-6">
            {/* Share Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Public/Private Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {shareSettings.isPublic ? (
                      <Unlock className="w-4 h-4 text-green-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-orange-600" />
                    )}
                    <Label htmlFor="isPublic">Public Access</Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShareSettings(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                  >
                    {shareSettings.isPublic ? 'Public' : 'Private'}
                  </Button>
                </div>

                {/* Password Protection */}
                {!shareSettings.isPublic && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password (Optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password to protect the link"
                      value={shareSettings.password}
                      onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                )}

                {/* Expiration */}
                <div className="space-y-2">
                  <Label>Link Expiration</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['never', '1day', '7days', '30days'].map((option) => (
                      <Button
                        key={option}
                        variant={shareSettings.expiresIn === option ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShareSettings(prev => ({ ...prev, expiresIn: option }))}
                      >
                        {getExpirationText(option)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowDownload">Allow Download</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShareSettings(prev => ({ ...prev, allowDownload: !prev.allowDownload }))}
                    >
                      {shareSettings.allowDownload ? 'Yes' : 'No'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowComments">Allow Comments</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShareSettings(prev => ({ ...prev, allowComments: !prev.allowComments }))}
                    >
                      {shareSettings.allowComments ? 'Yes' : 'No'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Share Button */}
            <Button 
              onClick={createShareLink} 
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? 'Creating Share Link...' : 'Create Share Link'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Share Link Display */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Your Share Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={shareData.url}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(shareData.url)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                {/* Share Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>Views: {shareData.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {shareData.isPublic ? (
                      <Unlock className="w-4 h-4 text-green-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-orange-600" />
                    )}
                    <span>{shareData.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                </div>

                {shareData.password && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <Lock className="w-4 h-4" />
                      <span className="font-medium">Password Protected</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      Share this password with viewers: <strong>{shareData.password}</strong>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(shareData.url)}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(shareData.url, '_blank')}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview
              </Button>
              
              <Button
                variant="outline"
                onClick={generateQRCode}
                className="flex-1"
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
            </div>

            {/* Create New Link */}
            <Button
              variant="outline"
              onClick={() => setShareData(null)}
              className="w-full"
            >
              Create New Share Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

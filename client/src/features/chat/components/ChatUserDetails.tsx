import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button.tsx";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {ChevronRight, File, FileText, ImageIcon, type LucideProps, MoreHorizontal, Video, ArrowLeft, Eye} from "lucide-react";
import {type ForwardRefExoticComponent, type RefAttributes, useEffect, useState} from "react";
import type {IUser} from "@/types/IUser.ts";
import {cropImage} from "@/lib/utils.ts";
import type {IMessage} from "@/types/message.ts";

interface FileType {
  type: string
  count: number
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
  color: string,
  extensions?: string[],
  files: string[]
}

const fileTypes: FileType[] = [
  {
    type: "Documents",
    count: 0,
    icon: FileText,
    color: "text-blue-600",
    extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    files: []
  },
  {
    type: "Photos",
    count: 0,
    icon: ImageIcon,
    color: "text-yellow-600",
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
    files: []
  },
  {
    type: "Movies",
    count: 0,
    icon: Video,
    color: "text-teal-600",
    extensions: ['mp4', 'mkv', 'mov', 'avi', 'wmv', 'flv'],
    files: []
  },
  {
    type: "Other",
    count: 0,
    icon: File,
    color: "text-red-600",
    extensions: ['zip', 'rar', '7z', 'mp3', 'wav', 'exe'],
    files: []
  },
]

export default function ChatUserDetails({user, messages}: { user: IUser, messages: IMessage[] }) {
  const [files, setFiles] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'fileTypes' | 'fileList'>('fileTypes');
  const [selectedFileType, setSelectedFileType] = useState<FileType | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const extractedFiles = messages
        .filter(msg => msg.content && msg.content.media && Array.isArray(msg.content.media) && msg.content.media.length > 0)
        .flatMap(msg => msg.content.media)
      setFiles(extractedFiles);
    } else {
      setFiles([]);
    }
  }, [messages]);

  const handleFileTypeClick = (fileType: FileType) => {
    setSelectedFileType(fileType);
    setCurrentView('fileList');
  };

  const handleBackClick = () => {
    setCurrentView('fileTypes');
    setSelectedFileType(null);
  };

  const handleFilePreview = (file: string) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const fileType = fileTypes.find(type => type.extensions?.includes(extension || ''));
    return fileType ? fileType.icon : File;
  };

  const getFileIconColor = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const fileType = fileTypes.find(type => type.extensions?.includes(extension || ''));
    return fileType ? fileType.color : 'text-gray-600';
  };

  const isImageFile = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension || '');
  };

  const isVideoFile = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['mp4', 'mkv', 'mov', 'avi', 'wmv', 'flv'].includes(extension || '');
  };

  const renderFilePreview = () => {
    if (!previewFile) return null;

    if (isImageFile(previewFile)) {
      return <img src={previewFile} alt="Preview" className="max-w-full max-h-[70vh] object-contain mx-auto" />;
    }

    if (isVideoFile(previewFile)) {
      return (
        <video controls className="max-w-full max-h-[70vh] mx-auto">
          <source src={previewFile} />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <File className="w-16 h-16 mb-4" />
        <p>Preview not available for this file type</p>
        <p className="text-sm mt-2">{previewFile.split('/').pop()}</p>
      </div>
    );
  };

  return (
    <>
      <Card className="w-80 flex flex-col h-full">
        <CardHeader className="text-center pb-4">
          <Avatar className="w-16 h-16 mx-auto mb-3">
            <AvatarImage src={cropImage(user.avatar) || "https://avatars.githubusercontent.com/u/124599?v=4"}/>
            <AvatarFallback className="bg-primary/10 text-primary text-lg">RE</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold mb-1">{user.fullName}</h3>
          <p className="text-sm text-muted-foreground">{user.about || "Full-Stack Engineer (MERN)"}</p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <Separator className="mb-6"/>

          {/* File Types or File List */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              {currentView === 'fileList' && selectedFileType ? (
                <>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleBackClick}>
                      <ArrowLeft className="w-4 h-4"/>
                    </Button>
                    <h4 className="font-semibold">{selectedFileType.type}</h4>
                  </div>
                  <span className="text-sm text-muted-foreground">{selectedFileType.count} files</span>
                </>
              ) : (
                <>
                  <h4 className="font-semibold">File type</h4>
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <MoreHorizontal className="w-4 h-4"/>
                  </Button>
                </>
              )}
            </div>

            <ScrollArea className="flex-1 overflow-y-auto">
              {currentView === 'fileTypes' ? (
                <div className="space-y-2 pb-2">
                  {fileTypes.map((fileType) => {
                    const filesArray = files.filter(file => {
                      const extension = file.split('.').pop()?.toLowerCase();
                      return fileType.extensions?.includes(extension || '');
                    })

                    fileType.count = filesArray.length || 0
                    fileType.files = filesArray

                    if (fileType.count === 0) return null;

                    return (
                      <div
                        key={fileType.type}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleFileTypeClick(fileType)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${fileType.color}`}>
                            <fileType.icon className="w-5 h-5"/>
                          </div>
                          <div>
                            <p className="font-medium">{fileType.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {fileType.count} files
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pb-2">
                  {selectedFileType?.files.map((file, index) => {
                    const FileIcon = getFileIcon(file);
                    const iconColor = getFileIconColor(file);
                    const fileName = file.split('/').pop() || file;

                    return (
                      <div
                        key={index}
                        className="relative group rounded-xl border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleFilePreview(file)}
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          {isImageFile(file) ? (
                            <div className="rounded-lg h-25 overflow-hidden bg-muted flex items-center justify-center">
                              <img src={file} alt={fileName} className="h-25"/>
                            </div>
                          ) : (
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}>
                              <FileIcon className="w-6 h-6"/>
                            </div>
                          )}
                        </div>

                        {/* Preview button overlay */}
                        <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white"/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="truncate">
              {previewFile?.split('/').pop() || 'File Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center overflow-auto">
            {renderFilePreview()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
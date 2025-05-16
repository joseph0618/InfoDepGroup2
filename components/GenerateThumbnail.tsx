import { Button } from "./ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Loader } from "lucide-react";
import Image from "next/image";
import { Textarea } from "./ui/textarea";
import { GenerateThumbnailProps } from "@/types";
import { useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "convex/react";
import { useUploadFiles } from "@xixixao/uploadstuff/react";
import { api } from "@/convex/_generated/api";

function GenerateThumbnail({
  setImageStorageId,
  image,
  setImage,
}: GenerateThumbnailProps) {
  const { toast } = useToast();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);

  const [isImageLoading, setIsImageLoading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const getImageUrl = useMutation(api.movies.getUrl);

  const handleImage = async (blob: Blob, fileName: string) => {
    setIsImageLoading(true);
    setImage("");
    try {
      const file = new File([blob], fileName, { type: "image/png" });
      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setImageStorageId(storageId);

      const imageUrl = await getImageUrl({ storageId });
      setImage(imageUrl!);
      setIsImageLoading(false);
      toast({
        title: "Thumbnail uploaded successfully",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error uploading thumbnail",
        variant: "destructive",
      });
    }
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    try {
      const files = e.target.files;
      if (!files) return;
      const file = files[0];
      const blob = await file.arrayBuffer().then((ab) => new Blob([ab]));
      handleImage(blob, file.name);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error uploading image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="image_div" onClick={() => imageRef?.current?.click()}>
        <Input
          type="file"
          className="hidden"
          ref={imageRef}
          onChange={(e) => uploadImage(e)}
        />
        {!isImageLoading ? (
          <Image
            src="/icons/upload-image.svg"
            width={40}
            height={40}
            alt="upload"
          />
        ) : (
          <div className="text-16 flex-center font-medium text-white-1">
            Uploading
            <Loader size={20} className="animate-spin ml-2" />
          </div>
        )}
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-12 font-bold text-orange-1">Click to upload</h2>
          <p className="text-12 font-normal text-gray-1">
            SVG, PNG, JPG, or GIF (max. 1080x1080px)
          </p>
        </div>
      </div>
      {image && (
        <div className="flex-center w-full">
          <Image
            src={image}
            width={200}
            height={200}
            alt="thumbnail"
            className="mt-5"
          />
        </div>
      )}
    </div>
  );
}

export default GenerateThumbnail;

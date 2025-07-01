"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useProModal } from "@/hooks/use-pro-modal";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Download, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [width, setWidth] = useState("1024");
  const [height, setHeight] = useState("1024");
  const [seed, setSeed] = useState(-1);
  const [responseExt, setResponseExt] = useState("png");
  const [numInferenceSteps, setNumInferenceSteps] = useState(4);
  const [imageData, setImageData] = useState<{ imageUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customWidth, setCustomWidth] = useState(1024);
  const [customHeight, setCustomHeight] = useState(1024);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const proModal = useProModal();

  async function handleEnhancePrompt() {
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPrompt(data.data);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setIsEnhancing(false);
    }
  }

  async function generateImage() {
    setIsGeneratingImage(true);
    setError(null);
    setImageData(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          width: width === "custom" ? customWidth : Number(width),
          height: height === "custom" ? customHeight : Number(height),
          seed: Number(seed),
          responseExt,
          numInferenceSteps,
        }),
      });
      const data = await res.json();
      if (res.status === 403) {
        proModal.onOpen();
        setImageData(null);
      }
      if (res.status === 200 && data.success && data.data) {
        setImageData(data.data); // data.data is an object
      } else {
        setError(data.message || "Failed to generate image");
        toast.error(data.message);
      }
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setIsGeneratingImage(false);
    }
  }

  // Copy image URL to clipboard and show toast
  const handleCopyUrl = async () => {
    const url = imageData?.imageUrl;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Image URL copied to clipboard!");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  // Download image
  const handleDownload = async () => {
    const url = imageData?.imageUrl;
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `generated-image.${responseExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success("Image downloaded!");
    } catch {
      toast.error("Failed to download image");
    }
  };

  // Share image (Web Share API)
  const handleShare = async () => {
    const url = imageData?.imageUrl;
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this AI generated image!",
          url,
        });
        toast.success("Image shared!");
      } catch {
        toast.error("Failed to share image");
      }
    } else {
      toast.error("Sharing is not supported on this device");
    }
  };

  return (
    <div className="w-full h-full">
      {/* Mobile: Tabs, Desktop: Panels */}
      <div className="block sm:hidden w-full h-full">
        <Tabs defaultValue="parameters" className="w-full h-full pt-10 px-4">
          <TabsList className="w-full">
            <TabsTrigger value="parameters" className="flex-1">
              Parameters
            </TabsTrigger>
            <TabsTrigger value="result" className="flex-1">
              Result
            </TabsTrigger>
          </TabsList>
          <TabsContent value="parameters" className="w-full">
            <div className="flex flex-col items-center justify-center p-2 w-full">
              <div className="w-full space-y-6">
                <h2 className="text-2xl font-bold">Generation Parameters</h2>
                <div>
                  <Label htmlFor="prompt" className="my-2">
                    Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your prompt here"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !prompt.trim()}
                  >
                    {isEnhancing ? "Enhancing..." : "Enhance Prompt ✨"}
                  </Button>
                </div>
                <div>
                  <Label htmlFor="negative-prompt" className="my-2">
                    Negative Prompt
                  </Label>
                  <Input
                    id="negative-prompt"
                    placeholder="Enter negative prompt"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="width" className="my-2">
                      Width
                    </Label>
                    <Select value={width} onValueChange={setWidth}>
                      <SelectTrigger id="width">
                        <SelectValue placeholder="Select width" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024">1024</SelectItem>
                        <SelectItem value="512">512</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <AnimatePresence>
                      {width === "custom" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Input
                            type="number"
                            min={64}
                            max={2048}
                            value={customWidth}
                            onChange={(e) =>
                              setCustomWidth(Number(e.target.value))
                            }
                            placeholder="Custom Width"
                            className="mt-2"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <Label htmlFor="height" className="my-2">
                      Height
                    </Label>
                    <Select value={height} onValueChange={setHeight}>
                      <SelectTrigger id="height">
                        <SelectValue placeholder="Select height" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024">1024</SelectItem>
                        <SelectItem value="512">512</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <AnimatePresence>
                      {height === "custom" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Input
                            type="number"
                            min={64}
                            max={2048}
                            value={customHeight}
                            onChange={(e) =>
                              setCustomHeight(Number(e.target.value))
                            }
                            placeholder="Custom Height"
                            className="mt-2"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div>
                  <div className="flex flex-col items-start justify-between">
                    <Label htmlFor="inference-steps" className="my-2">
                      Inference Steps
                    </Label>
                    <span className="text-sm text-muted-foreground my-2">
                      4
                    </span>
                  </div>
                  <Slider
                    id="inference-steps"
                    value={[numInferenceSteps]}
                    onValueChange={([val]) => setNumInferenceSteps(val)}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="seed" className="my-2">
                      Seed
                    </Label>
                    <Input
                      id="seed"
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="format" className="my-2">
                      File Format
                    </Label>
                    <Select value={responseExt} onValueChange={setResponseExt}>
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpg">JPG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={generateImage}
                  disabled={isGeneratingImage || !prompt.trim()}
                >
                  {isGeneratingImage ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="result" className="w-full">
            <div className="flex flex-col items-center justify-center p-2 w-full h-full">
              <div className="w-full h-full flex flex-col items-center justify-center rounded-lg relative">
                {isGeneratingImage ? (
                  <>
                    <div className="w-full flex flex-col items-center justify-center gap-4 flex-1">
                      <Skeleton className="w-full max-w-full max-h-[400px] h-[300px] rounded border shadow" />
                    </div>
                    <div className="w-full flex flex-row items-center gap-2 mt-4 absolute bottom-0 left-0 px-2 pb-2">
                      <Skeleton className="flex-1 h-9 rounded bg-muted" />
                      <Skeleton className="size-9 rounded bg-muted" />
                      <Skeleton className="size-9 rounded bg-muted" />
                      <Skeleton className="size-9 rounded bg-muted" />
                    </div>
                  </>
                ) : imageData ? (
                  <>
                    <div className="w-full flex flex-col items-center justify-center flex-1">
                      <img
                        src={imageData?.imageUrl}
                        alt="Generated"
                        className="max-w-full max-h-[400px] rounded border shadow"
                      />
                    </div>
                    <div className="w-full flex flex-row items-center gap-2 mt-4 absolute bottom-0 left-0 px-2 pb-2">
                      <Input
                        value={imageData?.imageUrl}
                        readOnly
                        className="flex-1 text-xs bg-muted cursor-pointer"
                        onClick={(e) => {
                          (e.target as HTMLInputElement).select();
                        }}
                        aria-label="Image URL"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCopyUrl}
                        title="Copy image URL"
                        aria-label="Copy image URL"
                      >
                        <Copy className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleDownload}
                        title="Download image"
                        aria-label="Download image"
                      >
                        <Download className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleShare}
                        title="Share image"
                        aria-label="Share image"
                      >
                        <Share2 className="size-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground text-center flex flex-1 items-center justify-center">
                    {error ? error : "Your generated image will appear here"}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <div className="hidden sm:block w-full h-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[85vh] mt-10 flex-col sm:flex-row"
          suppressHydrationWarning={true}
        >
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="flex h-full flex-col items-center justify-center p-2 sm:p-6 w-full">
              <div className="w-full space-y-6">
                <h2 className="text-2xl font-bold">Generation Parameters</h2>
                <div>
                  <Label htmlFor="prompt" className="my-2">
                    Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your prompt here"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[80px] sm:min-h-[120px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full sm:w-auto"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !prompt.trim()}
                  >
                    {isEnhancing ? "Enhancing..." : "Enhance Prompt ✨"}
                  </Button>
                </div>
                <div>
                  <Label htmlFor="negative-prompt" className="my-2">
                    Negative Prompt
                  </Label>
                  <Input
                    id="negative-prompt"
                    placeholder="Enter negative prompt"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width" className="my-2">
                      Width
                    </Label>
                    <Select value={width} onValueChange={setWidth}>
                      <SelectTrigger id="width">
                        <SelectValue placeholder="Select width" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024">1024</SelectItem>
                        <SelectItem value="512">512</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <AnimatePresence>
                      {width === "custom" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Input
                            type="number"
                            min={64}
                            max={2048}
                            value={customWidth}
                            onChange={(e) =>
                              setCustomWidth(Number(e.target.value))
                            }
                            placeholder="Custom Width"
                            className="mt-2"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <Label htmlFor="height" className="my-2">
                      Height
                    </Label>
                    <Select value={height} onValueChange={setHeight}>
                      <SelectTrigger id="height">
                        <SelectValue placeholder="Select height" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024">1024</SelectItem>
                        <SelectItem value="512">512</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <AnimatePresence>
                      {height === "custom" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Input
                            type="number"
                            min={64}
                            max={2048}
                            value={customHeight}
                            onChange={(e) =>
                              setCustomHeight(Number(e.target.value))
                            }
                            placeholder="Custom Height"
                            className="mt-2"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <Label htmlFor="inference-steps" className="my-2">
                      Inference Steps
                    </Label>
                    <span className="text-sm text-muted-foreground my-2 sm:ml-2">
                      4
                    </span>
                  </div>
                  <Slider
                    id="inference-steps"
                    value={[numInferenceSteps]}
                    onValueChange={([val]) => setNumInferenceSteps(val)}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seed" className="my-2">
                      Seed
                    </Label>
                    <Input
                      id="seed"
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="format" className="my-2">
                      File Format
                    </Label>
                    <Select value={responseExt} onValueChange={setResponseExt}>
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpg">JPG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={generateImage}
                  disabled={isGeneratingImage || !prompt.trim()}
                >
                  {isGeneratingImage ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className="hidden sm:block" />
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="flex h-full flex-col items-center justify-center p-2 sm:p-6">
              <div className="w-full h-full flex flex-col items-center justify-center rounded-lg relative">
                {isGeneratingImage ? (
                  <>
                    <div className="w-full flex flex-col items-center justify-center gap-4 flex-1">
                      <Skeleton className="w-full max-w-full max-h-[400px] h-[300px] rounded border shadow" />
                    </div>
                    <div className="w-full flex flex-row items-center gap-2 mt-4 absolute bottom-0 left-0 px-2 pb-2">
                      <Skeleton className="flex-1 h-9 rounded bg-muted" />
                      <Skeleton className="size-9 rounded bg-muted" />
                      <Skeleton className="size-9 rounded bg-muted" />
                      <Skeleton className="size-9 rounded bg-muted" />
                    </div>
                  </>
                ) : imageData ? (
                  <>
                    <div className="w-full flex flex-col items-center justify-center flex-1">
                      <img
                        src={imageData?.imageUrl}
                        alt="Generated"
                        className="max-w-full max-h-[400px] rounded border shadow"
                      />
                    </div>
                    <div className="w-full flex flex-row items-center gap-2 mt-4 absolute bottom-0 left-0 px-2 pb-2">
                      <Input
                        value={imageData?.imageUrl}
                        readOnly
                        className="flex-1 text-xs bg-muted cursor-pointer"
                        onClick={(e) => {
                          (e.target as HTMLInputElement).select();
                        }}
                        aria-label="Image URL"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCopyUrl}
                        title="Copy image URL"
                        aria-label="Copy image URL"
                      >
                        <Copy className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleDownload}
                        title="Download image"
                        aria-label="Download image"
                      >
                        <Download className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleShare}
                        title="Share image"
                        aria-label="Share image"
                      >
                        <Share2 className="size-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground text-center flex flex-1 items-center justify-center">
                    {error ? error : "Your generated image will appear here"}
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

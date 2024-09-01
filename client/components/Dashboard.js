"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Modal from "@/components/ui/modal";

const Dashboard = () => {
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [text, setText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [generatedPosts, setGeneratedPosts] = useState({
    linkedin_post: "",
    twitter_post: "",
    insta_post: "",
  });
  const [imageData, setImageData] = useState(null);

  const openManualModal = () => setIsManualModalOpen(true);
  const closeManualModal = () => setIsManualModalOpen(false);

  const openPromptModal = () => setIsPromptModalOpen(true);
  const closePromptModal = () => setIsPromptModalOpen(false);

  const handleGeneratePosts = async () => {
    if (!text || !companyName || !industry) {
      alert("Please fill out all fields");
      return;
    }
    setLoading2(true);
    try {
      const response = await axios.post(
        `${process.env.API_BASE_URL}/generate-posts/`,
        {
          text,
          name: companyName,
          industry,
        },
      );
      const formattedData = {
        linkedin_post: response.data.linkedin_post.replace(/\n/g, "<br />"),
        twitter_post: response.data.twitter_post.replace(/\n/g, "<br />"),
        insta_post: response.data.insta_post.replace(/\n/g, "<br />"),
      };
      setGeneratedPosts(formattedData);
      alert("Posts generated successfully");
    } catch (error) {
      console.error("Error generating posts:", error);
      alert("Failed to generate posts");
    } finally {
      setLoading2(false);
    }
  };

  // Function to download the image
  const downloadImage = (dataUrl) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "generated-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to share on social media
  const shareOnSocialMedia = (platform, dataUrl) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = new Image();

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      const imageBase64 = canvas.toDataURL("image/png");

      let url = "";
      const text = encodeURIComponent("Check out this image!");
      if (platform === "twitter") {
        url = `https://twitter.com/intent/tweet?url=${imageBase64}&text=${text}`;
      } else if (platform === "instagram") {
        alert(
          "Instagram does not support direct posting via URL. Please download and share manually.",
        );
        return;
      }
      window.open(url, "_blank");
    };

    image.src = dataUrl;
  };

  const handleGenerateImage = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.API_BASE_URL}/generate-image/`,
        {
          prompt: prompt,
        },
        { responseType: "arraybuffer" },
      );

      if (response.data instanceof ArrayBuffer) {
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            "",
          ),
        );
        setTimeout(() => {
          setImageData("data:;base64," + base64);
        }, 10000);
      } else {
        console.error("Unexpected server response format");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  const getPrompt = async () => {
    const apiUrl = `${process.env.API_BASE_URL}/automate-prompt/`;
    try {
      const response = await axios.get(apiUrl);
      if (typeof response.data === "string") {
        setPrompt(response.data);
      } else {
        console.error("Unexpected server response format");
      }
    } catch (error) {
      console.error("Error fetching prompt:", error);
    }
  };

  return (
    <div className="flex flex-row items-center justify-center h-45 p-4 mt-4">
      {/* Image Section */}
      <img
        src="/Generate.png"
        alt="Generate Content"
        className="mb-8 max-w-xs w-50 h-50 object-contain animate-pulse"
      />

      {/* Caption Generation Button */}
      <Button
        onClick={openManualModal}
        className="mb-4 m-4 px-8 py-4 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-lg"
      >
        Generate Caption!
      </Button>

      {/* Image Generation Button */}
      <Button
        onClick={openPromptModal}
        className="mb-4 m-4 px-8 py-4 text-lg bg-green-500 hover:bg-green-600 text-white rounded-md shadow-lg"
      >
        Generate Image!
      </Button>

      {/* Manual Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={closeManualModal}
        title="Post Generation"
      >
        <CardContent>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your company update here..."
            margin="normal"
            className="mb-4 p-2 border border-gray-300 rounded-md w-full"
          />
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter your company name..."
            margin="normal"
            className="mb-4 p-2 border border-gray-300 rounded-md w-full"
          />
          <Input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Enter your industry..."
            margin="normal"
            className="mb-4 p-2 border border-gray-300 rounded-md w-full"
          />
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button
            onClick={handleGeneratePosts}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md mt-2"
          >
            Generate Posts
          </Button>

          {loading2 && (
            <p className="mt-4 text-gray-600">
              Please wait while your post is loading...
            </p>
          )}

          {generatedPosts.linkedin_post && (
            <div className="mt-6 w-full">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Generated LinkedIn Post:
                </h3>
                <div
                  className="mt-2 p-4 bg-gray-100 rounded-md"
                  dangerouslySetInnerHTML={{
                    __html: generatedPosts.linkedin_post,
                  }}
                />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Generated Twitter Post:
                </h3>
                <div
                  className="mt-2 p-4 bg-gray-100 rounded-md"
                  dangerouslySetInnerHTML={{
                    __html: generatedPosts.twitter_post,
                  }}
                />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Generated Instagram Post:
                </h3>
                <div
                  className="mt-2 p-4 bg-gray-100 rounded-md"
                  dangerouslySetInnerHTML={{
                    __html: generatedPosts.insta_post,
                  }}
                />
              </div>

              {/* Social Media Sharing Buttons */}
              <div className="flex space-x-4 mt-4">
                {/* Share on Twitter */}
                <Button
                  onClick={() =>
                    shareOnSocialMedia("twitter", generatedPosts.twitter_post)
                  }
                  className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-md shadow-md flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.954 4.569c-.885.392-1.83.656-2.825.775 1.014-.611 1.794-1.574 2.163-2.724-.951.564-2.005.974-3.127 1.195-.897-.959-2.173-1.558-3.591-1.558-2.717 0-4.918 2.201-4.918 4.917 0 .385.045.761.126 1.122C7.688 8.094 4.066 6.13 1.64 3.161c-.423.722-.666 1.561-.666 2.475 0 1.709.87 3.213 2.188 4.096-.806-.025-1.566-.247-2.229-.616v.061c0 2.386 1.697 4.374 3.946 4.827-.413.111-.848.171-1.296.171-.316 0-.623-.03-.927-.085.624 1.951 2.445 3.374 4.604 3.413-1.685 1.321-3.808 2.108-6.102 2.108-.395 0-.786-.023-1.17-.067 2.179 1.397 4.768 2.213 7.557 2.213 9.054 0 14.004-7.498 14.004-14.004 0-.213 0-.425-.015-.637.961-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                  Twitter
                </Button>

                {/* Share on Instagram */}
                <Button
                  onClick={() =>
                    shareOnSocialMedia("instagram", generatedPosts.insta_post)
                  }
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md shadow-md flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.057 1.97.247 2.428.414a4.92 4.92 0 011.775 1.001 4.92 4.92 0 011.001 1.775c.167.458.357 1.258.414 2.428.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.057 1.17-.247 1.97-.414 2.428a4.92 4.92 0 01-1.001 1.775 4.92 4.92 0 01-1.775 1.001c-.458.167-1.258.357-2.428.414-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.057-1.97-.247-2.428-.414a4.92 4.92 0 01-1.775-1.001 4.92 4.92 0 01-1.001-1.775c-.167-.458-.357-1.258-.414-2.428C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.057-1.17.247-1.97.414-2.428a4.92 4.92 0 011.001-1.775 4.92 4.92 0 011.775-1.001c.458-.167 1.258-.357 2.428-.414C8.416 2.175 8.796 2.163 12 2.163zm0-2.163c-3.259 0-3.667.014-4.947.072-1.281.058-2.162.27-2.924.575a6.92 6.92 0 00-2.608 1.643A6.92 6.92 0 001.663 4.95c-.305.762-.517 1.643-.575 2.924-.058 1.281-.072 1.688-.072 4.947s.014 3.667.072 4.947c.058 1.281.27 2.162.575 2.924a6.92 6.92 0 001.643 2.608 6.92 6.92 0 002.608 1.643c.762.305 1.643.517 2.924.575 1.281.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.281-.058 2.162-.27 2.924-.575a6.92 6.92 0 002.608-1.643 6.92 6.92 0 001.643-2.608c.305-.762.517-1.643.575-2.924.058-1.281.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.281-.27-2.162-.575-2.924a6.92 6.92 0 00-1.643-2.608 6.92 6.92 0 00-2.608-1.643c-.762-.305-1.643-.517-2.924-.575C15.667.014 15.259 0 12 0zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162 0 3.403 2.759 6.162 6.162 6.162 3.403 0 6.162-2.759 6.162-6.162 0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.208 0-4-1.792-4-4s1.792-4 4-4 4 1.792 4 4-1.792 4-4 4zm6.406-10.845c-.796 0-1.444.648-1.444 1.444s.648 1.444 1.444 1.444 1.444-.648 1.444-1.444-.648-1.444-1.444-1.444z" />
                  </svg>
                  Instagram
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Modal>

      {/* Prompt Modal */}
      <Modal
        isOpen={isPromptModalOpen}
        onClose={closePromptModal}
        title="Poster Generation"
      >
        <CardContent>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            margin="normal"
            className="mb-4 p-2 border border-gray-300 rounded-md w-full"
          />
          <Button
            onClick={getPrompt}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md shadow-md"
          >
            Get Prompt
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button
            onClick={handleGenerateImage}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md mt-2"
          >
            Generate Image
          </Button>

          {loading && (
            <p className="mt-4 text-gray-600">
              Please wait while your image is being generated...
            </p>
          )}

          {imageData && (
            <div className="mt-4 flex flex-col items-center overflow-y-auto max-h-[40vh]">
              <img
                src={imageData}
                alt="Generated"
                className="max-w-full h-auto rounded-md shadow-lg mb-4"
              />

              <div className="flex space-x-4">
                {/* Download Button */}
                <Button
                  onClick={() => downloadImage(imageData)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 9a1 1 0 011-1h3V4a2 2 0 014 0v4h3a1 1 0 011 1v2a1 1 0 01-1 1h-3v4a2 2 0 11-4 0v-4H4a1 1 0 01-1-1V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download
                </Button>

                {/* Share on Twitter */}
                <Button
                  onClick={() => shareOnSocialMedia("twitter", imageData)}
                  className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-md shadow-md flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.954 4.569c-.885.392-1.83.656-2.825.775 1.014-.611 1.794-1.574 2.163-2.724-.951.564-2.005.974-3.127 1.195-.897-.959-2.173-1.558-3.591-1.558-2.717 0-4.918 2.201-4.918 4.917 0 .385.045.761.126 1.122C7.688 8.094 4.066 6.13 1.64 3.161c-.423.722-.666 1.561-.666 2.475 0 1.709.87 3.213 2.188 4.096-.806-.025-1.566-.247-2.229-.616v.061c0 2.386 1.697 4.374 3.946 4.827-.413.111-.848.171-1.296.171-.316 0-.623-.03-.927-.085.624 1.951 2.445 3.374 4.604 3.413-1.685 1.321-3.808 2.108-6.102 2.108-.395 0-.786-.023-1.17-.067 2.179 1.397 4.768 2.213 7.557 2.213 9.054 0 14.004-7.498 14.004-14.004 0-.213 0-.425-.015-.637.961-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                  Twitter
                </Button>

                {/* Share on Instagram */}
                <Button
                  onClick={() => shareOnSocialMedia("instagram", imageData)}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md shadow-md flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.057 1.97.247 2.428.414a4.92 4.92 0 011.775 1.001 4.92 4.92 0 011.001 1.775c.167.458.357 1.258.414 2.428.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.057 1.17-.247 1.97-.414 2.428a4.92 4.92 0 01-1.001 1.775 4.92 4.92 0 01-1.775 1.001c-.458.167-1.258.357-2.428.414-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.057-1.97-.247-2.428-.414a4.92 4.92 0 01-1.775-1.001 4.92 4.92 0 01-1.001-1.775c-.167-.458-.357-1.258-.414-2.428C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.057-1.17.247-1.97.414-2.428a4.92 4.92 0 011.001-1.775 4.92 4.92 0 011.775-1.001c.458-.167 1.258-.357 2.428-.414C8.416 2.175 8.796 2.163 12 2.163zm0-2.163c-3.259 0-3.667.014-4.947.072-1.281.058-2.162.27-2.924.575a6.92 6.92 0 00-2.608 1.643A6.92 6.92 0 001.663 4.95c-.305.762-.517 1.643-.575 2.924-.058 1.281-.072 1.688-.072 4.947s.014 3.667.072 4.947c.058 1.281.27 2.162.575 2.924a6.92 6.92 0 001.643 2.608 6.92 6.92 0 002.608 1.643c.762.305 1.643.517 2.924.575 1.281.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.281-.058 2.162-.27 2.924-.575a6.92 6.92 0 002.608-1.643 6.92 6.92 0 001.643-2.608c.305-.762.517-1.643.575-2.924.058-1.281.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.281-.27-2.162-.575-2.924a6.92 6.92 0 00-1.643-2.608 6.92 6.92 0 00-2.608-1.643c-.762-.305-1.643-.517-2.924-.575C15.667.014 15.259 0 12 0zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162 0 3.403 2.759 6.162 6.162 6.162 3.403 0 6.162-2.759 6.162-6.162 0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.208 0-4-1.792-4-4s1.792-4 4-4 4 1.792 4 4-1.792 4-4 4zm6.406-10.845c-.796 0-1.444.648-1.444 1.444s.648 1.444 1.444 1.444 1.444-.648 1.444-1.444-.648-1.444-1.444-1.444z" />
                  </svg>
                  Instagram
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Modal>
    </div>
  );
};

export default Dashboard;

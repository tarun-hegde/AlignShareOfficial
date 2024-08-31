"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";

const Dashboard = () => {
  const [imageData, setImageData] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error2, setError2] = useState(null);
  const [text, setText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [generatedPosts, setGeneratedPosts] = useState({
    linkedin_post: "",
    twitter_post: "",
    insta_post: ""
  });

  useEffect(() => {
    getPrompt();
  }, []);

  const getPrompt = async () => {
    try {
      // use the API_BASE_URL environment variable to make a request to the server
      // for local development, this will be http://0.0.0.0:8000/
      const response = await axios.get(`${process.env.API_BASE_URL}/`);
      if (typeof response.data === "string") {
        setPrompt(response.data);
      } else {
        console.error("Unexpected server response format");
      }
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    if (imageData) setLoading(false);
  }, [imageData]);

  const handleGenerateImage = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.API_BASE_URL}/generate-image/`,
        {
          prompt: prompt,
        },
        { responseType: "arraybuffer" }
      );

      if (response.data instanceof ArrayBuffer) {
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        setTimeout(() => {
          setImageData("data:;base64," + base64);
        }, 10000);
      } else {
        console.error("Unexpected server response format");
      }
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 503) {
        console.error("Service unavailable. Please try again later.");
      } else {
        setError(error);
      }
    }
  };

  const handleGeneratePosts = async () => {
    if (!text.trim()) {
      setError2("Text field cannot be empty");
      return;
    }
    if (!companyName.trim()) {
      setError2("Name field cannot be empty");
      return;
    }
    if (!industry.trim()) {
      setError2("Industry field cannot be empty");
      return;
    }

    setLoading2(true);
    setError2(null);
    try {
      const response = await axios.post(`${process.env.API_BASE_URL}/generate-posts/`,
        {
        text: text,
        name: companyName,
        industry: industry
      },
      {responseType: "json"}
    );
      console.log(response.data)
      const formattedData = {
        linkedin_post: response.data.linkedin_post.replace(/\n/g, '<br />'),
        twitter_post: response.data.twitter_post.replace(/\n/g, '<br />'),
        insta_post: response.data.insta_post.replace(/\n/g, '<br />')
      };
      setGeneratedPosts(formattedData);
    } catch (error2) {
      setLoading2(false);
      if (error2.response && error2.response.status === 503) {
        console.error("Service unavailable. Please try again later.");
      } else {
        setError2(error2);
      }
    } finally {
      setLoading2(false);
    }
  };

  const handleShareOnSocialMedia = async (platform) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      const dataURL = canvas.toDataURL("image/jpeg");
      switch (platform) {
        case "facebook":
          handleShareOnFacebook(dataURL);
          break;
        case "twitter":
          handleShareOnTwitter(dataURL);
          break;
        case "instagram":
          handleShareOnInstagram(dataURL);
          break;
        default:
          break;
      }
    };
    image.src = imageData;
  };

  const handleShareOnFacebook = (dataURL) => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      dataURL
    )}`;
    window.open(url, "_blank");
  };

  const handleShareOnTwitter = (dataURL) => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      dataURL
    )}&text=Check out this image!`;
    window.open(url, "_blank");
  };

  const handleShareOnInstagram = (dataURL) => {
    const url = `https://www.instagram.com/?caption=${encodeURIComponent(
      "Check out this image!"
    )}&url=${encodeURIComponent(dataURL)}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      <Card>
      <CardContent>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your company update here..."
            margin="normal"
          />
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter your company name..."
            margin="normal"
          />
          <Input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Enter your industry..."
            margin="normal"
          />
        </CardContent>

        <CardFooter className="flex flex-col items-center">
          <Button onClick={handleGeneratePosts} style={{ marginTop: '10px' }}>
            Generate Posts
          </Button>
          {loading2 && (
            <p style={{ color: "white", marginTop: "12px" }}>
              Please wait for a while, your post is being generated...
            </p>
          )}
         
        {generatedPosts.linkedin_post && !loading2 && (
          
            <div style={{ marginTop: '20px', color: 'white' }}>
               <Card>
               <CardContent style={{ marginTop: '20px', color: 'white' }}>
              <h3>Generated LinkedIn Post:</h3>
              <p dangerouslySetInnerHTML={{ __html: generatedPosts.linkedin_post }} />
              </CardContent>
              </Card>
              <Card>
              <CardContent style={{ marginTop: '20px', color: 'white' }}>
              <h3>Generated Twitter Post:</h3>
              <p dangerouslySetInnerHTML={{ __html: generatedPosts.twitter_post }} />
              </CardContent>
            </Card>
            <Card>
            <CardContent style={{ marginTop: '20px', color: 'white' }}>
              <h3>Generated Instagram Post:</h3>
              <p dangerouslySetInnerHTML={{ __html: generatedPosts.insta_post }} />
        
            </CardContent>
            </Card>
            </div>
            
          )}
         
          {error && <p>Error: {JSON.stringify(error)}</p>}
        </CardFooter>
        <CardContent>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your company update here..."
          />
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button onClick={handleGenerateImage}>Generate</Button>
          {loading && (
            <p style={{ color: "white", marginTop: "12px" }}>
              Please wait for a while, your image is being generated...
            </p>
          )}
          {imageData && !loading && (
            <>
              <img
                src={imageData}
                alt="Generated"
                style={{ width: "300px", height: "300px", marginTop: "20px" }}
              />
              <div style={{ marginTop: "20px" }}>
                <p
                  style={{
                    color: "white",
                    textAlign: "center",
                    marginBottom: "8px",
                  }}
                >
                  Share this update on:
                </p>
                <Button
                  onClick={() => handleShareOnSocialMedia("facebook")}
                  style={{ marginRight: "10px" }}
                >
                  Facebook
                </Button>
                <Button
                  onClick={() => handleShareOnSocialMedia("twitter")}
                  style={{ marginRight: "10px" }}
                >
                  Twitter
                </Button>
                <Button onClick={() => handleShareOnSocialMedia("instagram")}>
                  Instagram
                </Button>
              </div>
            </>
          )}
          {error && <p>Error: {JSON.stringify(error)}</p>}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import axios from 'axios';

const Dashboard = () => {
    const [imageData, setImageData] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (imageData) setLoading(false);
    }, [imageData]);

    const handleGenerateImage = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://0.0.0.0:8000/generate-image/', {
                prompt: prompt,
            }, { responseType: 'arraybuffer' });

            const base64 = btoa(
                new Uint8Array(response.data).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    '',
                ),
            );
            setImageData("data:;base64," + base64);
        } catch (error) {
            setLoading(false);
            if (error.response && error.response.status === 503) {
                console.error('Service unavailable. Please try again later.');
            } else {
                setError(error);
            }
        }
    }

    const handleShareOnFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank');
    }
    
    const handleShareOnTwitter = () => {
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=Check out this image!`;
        window.open(url, '_blank');
    }

    const handleShareOnInstagram = () => {
        const caption = encodeURIComponent('Check out this image!');
        const url = `https://www.instagram.com/?caption=${caption}`;
        window.open(url, '_blank');
    }

    const handleShareOnSocialMedia = (platform) => {
        switch (platform) {
            case 'facebook':
                handleShareOnFacebook();
                break;
            case 'twitter':
                handleShareOnTwitter();
                break;
            case 'instagram':
                handleShareOnInstagram();
                break;
            default:
                break;
        }
    }

    return (
        <div>
            <Card>
                <CardContent>
                    <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your company update here..."
                    />
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                    <Button onClick={handleGenerateImage}>Generate</Button>
                    {loading &&  <p style={{ color: "white", marginTop: "12px" }}>Please wait for a while, your image is being generated...</p>}
                    {imageData && !loading && (
                        <>
                            <img src={imageData} alt="Generated" style={{ width: '300px', height: '300px', marginTop: '20px' }} />
                            <div style={{ marginTop: '20px' }}>
                            <p style={{ color: "white", textAlign: "center", marginBottom: "8px"}}>Share this update on:</p>
                            <Button onClick={() => handleShareOnSocialMedia('facebook')} style={{ marginRight: '10px' }}>Facebook</Button>
                            <Button onClick={() => handleShareOnSocialMedia('twitter')} style={{ marginRight: '10px' }}>Twitter</Button>
                            <Button onClick={() => handleShareOnSocialMedia('instagram')}>Instagram</Button>

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

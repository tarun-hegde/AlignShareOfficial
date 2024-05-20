"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Input } from "@/components/ui/input"
import axios from 'axios';
const Dashboard = () => {
    const [imageData, setImageData] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        imageData;
    }, [imageData]);

    const handleGenerateImage = async () => {
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
            if (error.response && error.response.status === 503) {
                // Handle 503 error here
                console.error('Service unavailable. Please try again later.');
            } else {
                setError(error);
            }
        }
    }

    const [loading, setLoading] = useState(false);

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>AlignShare</CardTitle>
                    <CardDescription>Enabling organizations sharing updates in an easy and efficient manner</CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter Your Prompt here"
                    />
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGenerateImage}>Generate Image</Button>
                    {loading && <p>Loading...</p>}
                    {imageData && !loading && <img src={imageData} alt="Generated" style={{ width: '500px', height: '500px' }} onLoad={() => setLoading(false)} />}
                    {error && <p>Error: {JSON.stringify(error)}</p>}
                </CardFooter>
            </Card>
        </div>
    );

};

export default Dashboard;
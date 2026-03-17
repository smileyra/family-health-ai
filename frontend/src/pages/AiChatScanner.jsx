import React, { useState, useRef, useEffect } from 'react';
import { Send, UploadCloud, FileText, Image as ImageIcon, Loader2, Bot, User, Trash2 } from 'lucide-react';
import axios from 'axios';

const AiChatScanner = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello! I am your Family Health AI Assistant. You can upload any medical document (X-ray, Lab Report, Prescription) here, and we can discuss it.' }
    ]);
    const [inputStr, setInputStr] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleSend = async () => {
        if (!inputStr.trim() && !selectedFile) return;

        const newMsg = { role: 'user', text: inputStr };
        if (selectedFile) {
             newMsg.fileName = selectedFile.name;
        }

        const updatedHistory = [...messages, newMsg];
        setMessages(updatedHistory);
        setInputStr('');
        setIsLoading(true);

        const formData = new FormData();
        if (selectedFile) {
            formData.append('document', selectedFile);
        }
        formData.append('message', newMsg.text || 'Please analyze this document.');
        
        // Exclude the last message from history since we send it as current 'message'
        formData.append('chatHistory', JSON.stringify(messages));

        try {
            const res = await axios.post('http://localhost:5000/api/ai/chat-scanner', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
            // We can optionally clear the selected file after initial upload,
            // but for a continuing chat about a document, maybe we keep it? 
            // Better to clear it so the next message is just text, unless they upload again.
            removeFile();
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, there was an error connecting to the AI.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            
            {/* Header */}
            <div className="h-16 border-b border-gray-100 flex items-center px-6 bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">AI Medical Assistant</h2>
                    <p className="text-xs text-blue-600 font-medium">Powered by Gemini &copy;</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-700 ml-3' : 'bg-blue-600 text-white mr-3'}`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>

                            {/* Bubble */}
                            <div className={`px-5 py-3.5 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                                {msg.fileName && (
                                    <div className={`flex items-center mb-2 p-2 rounded-lg text-xs font-medium ${msg.role === 'user' ? 'bg-indigo-500/50' : 'bg-gray-100'}`}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        <span>Attached: {msg.fileName}</span>
                                    </div>
                                )}
                                <div className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white mr-3 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="px-5 py-3 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm flex items-center">
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                <span className="ml-3 text-sm text-gray-500 font-medium">Analyzing document and generating response...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                {selectedFile && (
                    <div className="mb-3 flex items-center bg-blue-50/50 border border-blue-100 p-2 rounded-lg relative max-w-sm">
                        {previewUrl ? (
                             <img src={previewUrl} alt="preview" className="w-10 h-10 object-cover rounded mr-3 border border-blue-200" />
                        ) : (
                             <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center mr-3">
                                 <FileText className="w-5 h-5" />
                             </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button onClick={removeFile} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
                
                <div className="flex items-end space-x-2">
                    <label className="flex items-center justify-center w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors text-gray-500 shrink-0 group">
                        <UploadCloud className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
                        <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                    </label>

                    <div className="flex-1 relative">
                        <textarea
                            value={inputStr}
                            onChange={(e) => setInputStr(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask about a medical document..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none font-medium text-gray-800"
                            rows={1}
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                        />
                    </div>

                    <button 
                        onClick={handleSend}
                        disabled={isLoading || (!inputStr.trim() && !selectedFile)}
                        className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shrink-0 disabled:opacity-50 shadow-sm"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiChatScanner;

import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, HelpCircle, Menu, Wifi, Phone, Ticket, Layers, Globe, X } from 'lucide-react';
import { Badge } from 'antd';
import { api } from '../utils/api';
import { useParams } from 'react-router-dom';

export default function Preparation() {


    const [article, setArticle] = useState({
        ref: "",
        desgin: "",
        profondeur: "",
        episseur: "",
        chant: "",
        qte: 0,
        color: ""
    });


    const { id } = useParams()


    const [palette, setPalette] = useState(null);

    const handleScan = () => {

    }

    const handleSubmit = async () => {
        const response = await api.post("");
    }


    const passes = [
        {
            id: 1,
            title: 'Tiktok & YouTube Pass 2,5Go',
            subtitle: '2,5Go',
            price: '10',
            days: 7,
            promo: true,
            category: 'social',
            icon: '🎬'
        },
        {
            id: 2,
            title: 'Tiktok & YouTube Pass 5Go',
            subtitle: '5Go',
            price: '20',
            days: 15,
            promo: true,
            category: 'social',
            icon: '🎬'
        },
        {
            id: 3,
            title: 'Unlimited Social Media *6 Pass',
            subtitle: '',
            price: '30',
            days: 30,
            promo: false,
            category: 'social',
            icon: '📱'
        },
        {
            id: 4,
            title: '1Gb Internet Pass',
            subtitle: '1Go',
            price: '10',
            days: 7,
            promo: false,
            category: 'internet',
            icon: '🌐'
        }
    ];


    return (
        <div className="min-h-scree">
            <div className="mb-4">
                {/* QR Code Display */}
                <div className="flex justify-center mb-6">
                    <div className="border-2 border-gray-300 rounded-lg p-20 flex items-center justify-center bg-gray-50">
                        {/* QRCode content */}
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <input
                        type="text"
                        placeholder="Designation"
                        readOnly
                        value={article.desgin}
                        className="border-2 w-full border-gray-300 text-lg py-2 px-4 rounded-md focus:outline-none focus:ring-2 bg-gray-200 focus:ring-blue-500 focus:border-transparent"
                    />

                    <div className="grid grid-cols-3 gap-3">
                        <input
                            className="border-2 py-2 border-gray-300 text-lg w-full px-4 rounded-md focus:outline-none focus:ring-2 bg-gray-200 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Profondeur"
                            type="text"
                            value={article.profondeur}
                            readOnly
                        />
                        <input
                            className="border-2 py-2 border-gray-300 text-lg w-full px-4 rounded-md focus:outline-none focus:ring-2 bg-gray-200 focus:ring-blue-500 focus:border-transparent"
                            type="text"
                            placeholder="Chant"
                            value={article.chant}
                            readOnly
                        />
                        <input
                            className="border-2 py-2 border-gray-300 text-lg w-full px-4 rounded-md focus:outline-none focus:ring-2 bg-gray-200 focus:ring-blue-500 focus:border-transparent"
                            type="text"
                            placeholder="Episseur"
                            value={article.episseur}
                            readOnly
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setArticle(prev => ({ ...prev, qte: prev.qte - 1 }))} className="text-xl py-2 px-8 border-2 border-gray-300 rounded-md hover:bg-gray-100 flex-shrink-0">-</button>
                        <input
                            type="text"
                            className="border-2 w-full border-gray-300 text-lg py-2 px-4 text-center rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Quantity"
                            value={article.qte}
                            min={1}
                            onChange={(e) => setArticle({ ...article, qte: e.target.value })}
                        />
                        <button onClick={() => setArticle(prev => ({ ...prev, qte: prev.qte - 1 }))} className="text-xl py-2 px-8 border-2 border-gray-300 rounded-md hover:bg-gray-100 flex-shrink-0">+</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button className="text-lg py-3 border-2 border-gray-300 rounded-md bg-white hover:bg-gray-100 transition-colors">NV Palette</button>
                    <button onClick={handleSubmit} className="text-lg py-3 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 transition-colors">Valider</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {passes.map((pass) => (
                    <Badge.Ribbon text="CAB09111" color="cyan">
                        <div key={pass.id} className="rounded-2xl overflow-hidden bg-gray-20 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="p-3 sm:p-4 relative bg-amber-50">
                                <div className="flex justify-between items-start sm:items-center mt-4 sm:mt-6">
                                    <div className="flex flex-col">
                                        <h3 className="text-md sm:text-md text-gray-600 font-bold leading-tight">Caisson Bas Normale 700*700</h3>
                                        <span className="text-sm sm:text-lg text-gray-600">- Gris </span>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-3xl sm:text-xl md:text-5xl font-bold text-gray-600">{pass.price}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-2 sm:mt-4">
                                    <div className="flex items-center">
                                        <span className="ml-1 sm:ml-2 md:text-base text-sm sm:text-lg text-gray-600">Profondeur: 58 | Episseur: 18 |  Chant: B</span>
                                    </div>
                                    <button className="bg-red-500 hover:bg-red-700 cursor-pointer p-2 text-white font-bold  rounded-full text-sm sm:text-base transition duration-200">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Badge.Ribbon>
                ))}
            </div>
        </div>
    );
}
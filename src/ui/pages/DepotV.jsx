import React, { useState, useMemo, useEffect } from 'react';
import { Package, Search, Filter, MapPin, Grid, List } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { message, Modal } from 'antd';
import { api } from '../utils/api';
import Spinner from '../components/ui/Spinner';
import EmplacementModal from '../components/ui/EmplacementModal';

const DepotV = () => {
    const [emplacements, setemplacements] = useState([])
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState('');
    const [selectedColumn, setSelectedColumn] = useState('');
    const [selectedFloor, setSelectedFloor] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedEmplacement, setSelectedEmplacement] = useState(null);
    const [loading, setLoading] = useState(true)
    const { id } = useParams()


    // Fixed: Added 'id' dependency
    useEffect(() => {
        if (id) fetchEmplacements();
    }, [id]);

    const fetchEmplacements = async () => {
        try {
            const { data } = await api.get(`depots/${id}`)
            setLoading(false)
            setemplacements(data.emplacements)
            console.log(data.emplacements);
        } catch (error) {
            setLoading(false)
            message.error(error.response?.data?.message || 'An error occurred')
            console.error(error.response)
        }
    }

    const parseEmplacement = (code) => {
    if (!code || typeof code !== 'string') return null;

    const parts = code.split('-');
    const floorMatch = parts[1]?.match(/(\d+)([A-Z])(\d+)/);
    if (!floorMatch) return null;

    const rowNumber = parseInt(floorMatch[1]);
    const floorLetter = floorMatch[2];
    const columnNumber = parseInt(floorMatch[3]);
    const emplacementNumber = parts[2];

    return { code, rowNumber, floorLetter, columnNumber, emplacementNumber };
    };



    const organizedData = useMemo(() => {
        const grouped = {};
        emplacements.forEach(emp => {
            const parsed = parseEmplacement(emp.code);
            if (!parsed) return;

            if (!grouped[parsed.floorLetter]) {
                grouped[parsed.floorLetter] = {};
            }
            if (!grouped[parsed.floorLetter][parsed.rowNumber]) {
                grouped[parsed.floorLetter][parsed.rowNumber] = {};
            }
            if (!grouped[parsed.floorLetter][parsed.rowNumber][parsed.columnNumber]) {
                grouped[parsed.floorLetter][parsed.rowNumber][parsed.columnNumber] = [];
            }
            grouped[parsed.floorLetter][parsed.rowNumber][parsed.columnNumber].push(parsed);
        });
        return grouped;
    }, [emplacements]); // Fixed: Added dependency

    // Fixed: Correct data access and added 'emplacements' dependency
    const filteredEmplacements = useMemo(() => {
        return emplacements.filter(emp => {
            const parsed = parseEmplacement(emp.code); // Fixed: Use emp.code
            if (!parsed) return false;

            const matchesSearch = emp.code.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRow = !selectedRow || parsed.rowNumber.toString() === selectedRow;
            const matchesColumn = !selectedColumn || parsed.columnNumber.toString() === selectedColumn;
            const matchesFloor = !selectedFloor || parsed.floorLetter === selectedFloor;
            return matchesSearch && matchesRow && matchesColumn && matchesFloor;
        });
    }, [emplacements, searchTerm, selectedRow, selectedColumn, selectedFloor]); // Fixed: Added 'emplacements'

    // Get unique rows, columns, and floors for filters
    const uniqueRows = [...new Set(emplacements.map(emp => parseEmplacement(emp.code)?.rowNumber).filter(Boolean))].sort((a, b) => a - b);
    const uniqueColumns = [...new Set(emplacements.map(emp => parseEmplacement(emp.code)?.columnNumber).filter(Boolean))].sort((a, b) => a - b);
    const uniqueFloors = [...new Set(emplacements.map(emp => parseEmplacement(emp.code)?.floorLetter).filter(Boolean))].sort();

    // Fixed: Consistent status generation using memoization
    const statusCache = useMemo(() => {
        const cache = {};
        emplacements.forEach(emp => {
            const statuses = ['occupied', 'Disponible', 'maintenance', 'Réservé'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const colors = {
                occupied: 'bg-red-500',
                available: 'bg-green-500',
                maintenance: 'bg-yellow-500',
                reserved: 'bg-blue-500'
            };
            cache[emp.code] = { status, color: colors[status] };
        });
        return cache;
    }, [emplacements]);

    const getEmplacementStatus = (code) => {
        return statusCache[code] || { status: 'Disponible', color: 'bg-green-500' };
    };

    const EmplacementCard = ({ emplacement, onClick }) => {
        const { status, color } = getEmplacementStatus(emplacement.code); // Fixed: Use emplacement.code
        const parsed = parseEmplacement(emplacement.code); // Fixed: Use emplacement.code

        return (
            <div
                className="relative bg-white rounded-lg border-2 border-gray-200 p-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-400 hover:scale-105"
                onClick={() => onClick(emplacement.code)} // Fixed: Use emplacement.code
            >
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${color}`}></div>
                <div className="flex items-center mb-2">
                    <Package className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="font-mono text-sm font-semibold text-gray-800">{emplacement.code}</span>
                </div>
                {parsed && (
                    <div className="text-xs text-gray-500 space-y-1">
                        <div>Étage : {parsed.floorLetter}</div>
                        <div>Rangée : {parsed.rowNumber}</div>
                        <div>Colonne : {parsed.columnNumber}</div>
                        <div>Position : {parsed.emplacementNumber}</div>
                    </div>
                )}

                <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${status === 'occupied' ? 'bg-red-100 text-red-800' :
                            status === 'available' ? 'bg-green-100 text-green-800' :
                                status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                        }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                </div>
            </div>
        );
    };

    const GridView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredEmplacements.map(emp => (
                <EmplacementCard
                    key={emp.code} // Fixed: Use emp.code
                    emplacement={emp}
                    onClick={setSelectedEmplacement}
                />
            ))}
        </div>
    );


    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const WarehouseView = () => (
        <div className="space-y-8">
            {uniqueFloors.map(floorLetter => (
                <div key={floorLetter} className="space-y-6">
                    <div className="flex items-center">
                        <div className="bg-purple-600 text-white p-2 rounded-lg font-bold text-md">
                            Étage {floorLetter}
                        </div>
                    </div>

                    {uniqueRows.map(rowNum => {
                        const floorData = organizedData[floorLetter];
                        if (!floorData || !floorData[rowNum]) return null;

                        return (
                            <div key={`${floorLetter}-${rowNum}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 ml-8">
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                        Rangée {rowNum}
                                    </div>
                                    <div className="ml-4 text-sm text-gray-600">
                                        {Object.keys(floorData[rowNum] || {}).length} Columns
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                                    {uniqueColumns.map(colNum => {
                                        const columnEmplacements = floorData[rowNum]?.[colNum] || [];
                                        if (columnEmplacements.length === 0) return null;

                                        return (
                                            <div key={colNum} className="space-y-2">
                                                <div className="text-center">
                                                    <div className="bg-gray-100 px-2 py-1 rounded font-medium text-sm text-gray-700">
                                                        COL {colNum}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {columnEmplacements.map(emp => {
                                                        // Fixed: Check if the emplacement code is in filtered results
                                                        const isFiltered = filteredEmplacements.some(fe => fe.code === emp.code);
                                                        if (!isFiltered) return null;

                                                        return (
                                                            <div
                                                                key={emp.code}
                                                                className="bg-gray-50 border border-gray-200 rounded p-2 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                                                onClick={() => setSelectedEmplacement(emp.code)}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-mono text-xs">{emp.emplacementNumber}</span>
                                                                    <div className={`w-2 h-2 rounded-full ${getEmplacementStatus(emp.code).color}`}></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );

    // Fixed: Added loading state handling
    if (loading) {
        return (
            <Spinner />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Depot Management</h1>
                                <p className="text-gray-600">Depot K - Étage  A</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Grid className="w-4 h-4 mr-2" />
                                    Grille
                                </button>
                                <button
                                    onClick={() => setViewMode('warehouse')}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'warehouse'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Entrepôt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Recherche */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher des emplacements..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filtre Étage */}
                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={selectedFloor}
                            onChange={(e) => setSelectedFloor(e.target.value)}
                        >
                            <option value="">Tous les étages</option>
                            {uniqueFloors.map(floor => (
                                <option key={floor} value={floor}>Étage {floor}</option>
                            ))}
                        </select>

                        {/* Filtre Rangée */}
                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={selectedRow}
                            onChange={(e) => setSelectedRow(e.target.value)}
                        >
                            <option value="">Toutes les rangées</option>
                            {uniqueRows.map(row => (
                                <option key={row} value={row}>Rangée {row}</option>
                            ))}
                        </select>

                        {/* Filtre Colonne */}
                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                        >
                            <option value="">Toutes les colonnes</option>
                            {uniqueColumns.map(col => (
                                <option key={col} value={col}>Colonne {col}</option>
                            ))}
                        </select>

                        {/* Statistiques */}
                        <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
                            <span className="text-sm text-gray-600">
                                {filteredEmplacements.length} / {emplacements.length} Emplacements
                            </span>
                        </div>
                    </div>
                </div>
                {/* Main Content */}
                {viewMode === 'grid' ? <GridView /> : <WarehouseView />}
            </div>
            <EmplacementModal
                selectedEmplacement={selectedEmplacement}
                setSelectedEmplacement={setSelectedEmplacement}
                handleOk={handleOk}
                parseEmplacement={parseEmplacement}
                getEmplacementStatus={getEmplacementStatus}
            />

        </div>
    );
};

export default DepotV;
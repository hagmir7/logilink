import React, { useState } from 'react';
import { api } from '../utils/api';

function RoleForm({ onClose }) {

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        name: ''
    });


    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault();
        const response = await api.post('roles', data);
        console.log(response.data);

        setLoading(false)
        setData({ name: "" });

    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };



    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label className='block mb-2 font-medium'>
                    Role <span className='text-red-500'>*</span>
                </label>
                <input
                    type='text'
                    name='name'
                    value={data.name}
                    onChange={handleChange}
                    placeholder="Role..."
                    className={`w-full p-3 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"`}
                    required
                />
            </div>
            <div className='mt-3 flex justify-end w-full'>
                <button
                    type='submit'
                    disabled={loading}
                    onClick={onClose}
                    className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-300'
                >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>
        </form>
    )
}

export default RoleForm
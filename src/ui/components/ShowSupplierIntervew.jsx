import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { useParams } from 'react-router-dom'
import { formatDate } from '../utils/config'

export default function ShowSupplierIntervew() {
  const [data, setData] = useState(null)
  const [notes, setNotes] = useState({})

  const { id } = useParams();
  

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await api.get(`supplier-interviews/${id}`)

        setData(data)

        const init = {}
        data.criterias.forEach(c => {
          init[c.id] = c.note ?? ''
        })
        setNotes(init)

      } catch (error) {
        console.error('Failed to load interview', error)
      }
    }

    fetchInterview()
  }, [])


const handleNoteChange = async (criteriaId, value) => {
  setNotes(prev => ({ ...prev, [criteriaId]: value }))

  try {
    await api.post(
      `supplier-interviews/${data.interview.id}/criteria`,
      {
        criteria_id: criteriaId,
        note: Number(value),
      }
    )
  } catch (error) {
    console.error('Save failed', error)
  }
}

  const total = Object.values(notes)
    .map(Number)
    .filter(Boolean)
    .reduce((a, b) => a + b, 0)

  if (!data) return <p className="p-4">Chargement...</p>

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
       <h2 className="text-lg font-semibold">Évaluation Fournisseur</h2>
      <div className='flex justify-between gap-2'>
       
        <p className="text-gray-800 py-2 px-4 rounded-2xl shadow-2xs bg-gray-50 border border-gray-100">
           <strong>Producit / Service Achate</strong>  
            <div className='mt-2'>{data.interview.description}</div>
        </p>
        <p className="text-gray-800 py-2 px-4 rounded-2xl shadow-2xs bg-gray-50 border border-gray-100">
           <strong>Date D'Evaluation</strong>
  
          <div className='mt-2'>{formatDate(data.interview.created_at)}</div>
        </p>
        <p className="text-gray-800 py-2 px-4 rounded-2xl shadow-2xs bg-gray-50 border border-gray-100">
          <strong>Fournisseur</strong>
          <div className='mt-2'>{data.interview?.client?.CT_Intitule}</div>
        </p>
        <p className="text-gray-800 py-2 px-4 rounded-2xl shadow-2xs bg-gray-50 border border-gray-100">
           <strong>Fournisseur</strong> 
           <div className='mt-2'>{data.interview?.CT_Num}</div>
        </p>

      </div>

      {/* Table */}
      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Critère d'évaluation</th>
            <th className="border px-3 py-2 w-64">Niveau réel</th>
          </tr>
        </thead>

        <tbody>
          {data.criterias.map(c => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{c.description}</td>
              <td className="border px-3 py-2">
                <select
                  className="w-full border rounded px-2 py-1"
                  value={notes[c.id]}
                  onChange={(e) =>
                    handleNoteChange(c.id, e.target.value)
                  }
                >
                  <option value="">—</option>
                  <option value="1">1 - Insatisfaisant</option>
                  <option value="2">2 - Satisfaisant</option>
                  <option value="3">3 - Très satisfaisant</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>

        {/* TOTAL */}
        <tfoot className="bg-gray-100 font-semibold">
          <tr>
            <td className="border px-3 py-2 text-right">Total</td>
            <td className="border px-3 py-2">{total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

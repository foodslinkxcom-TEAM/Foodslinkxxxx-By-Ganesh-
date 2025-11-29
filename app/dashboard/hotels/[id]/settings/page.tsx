
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface IHotel {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  upiId: string;
  verified: boolean;
  plan: string;
  maxTables: number;
  maxOrdersPerTable: number;
  locationVerificationRadius: number;
  planExpiry: string;
}

export default function SettingsPage() {
  const params = useParams();
  const hotelId = params.id as string;
  const [hotel, setHotel] = useState<IHotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await fetch(`/api/hotels/${hotelId}`);
        if (!res.ok) throw new Error('Failed to fetch hotel data');
        const data = await res.json();
        setHotel(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [hotelId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (hotel) {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      setHotel({
        ...hotel,
        [name]:
          type === 'checkbox'
            ? checked
            : type === 'number'
            ? Number(value)
            : value,
      });
    }
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (hotel) {
            setHotel({
              ...hotel,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        },
        (error) => {
          alert('Error getting location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hotel) return;

    try {
      const res = await fetch(`/api/hotels/${hotelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotel),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          // Show field-level errors
          const errorMessages = Object.values(data.errors).join('\n');
          alert(`Validation errors:\n${errorMessages}`);
        } else {
          throw new Error(data.error || 'Failed to update hotel data');
        }
        return;
      }

      alert('Hotel data updated successfully!');
      // Refresh the page or update state
      window.location.reload();
    } catch (error: any) {
      alert(`Failed to update hotel data: ${error.message}`);
    }
  };

  if (loading) return <p className="text-center mt-16">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-16">{error}</p>;
  if (!hotel) return <p className="text-center mt-16">Hotel not found.</p>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Hotel Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={hotel.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={hotel.address}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="upiId" className="block text-sm font-semibold text-gray-700">UPI ID</label>
                <input
                  type="text"
                  id="upiId"
                  name="upiId"
                  value={hotel.upiId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );
      case 'location':
        return (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Location Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="latitude" className="block text-sm font-semibold text-gray-700">Latitude</label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={hotel.latitude}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  step="any"
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-semibold text-gray-700">Longitude</label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={hotel.longitude}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  step="any"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleLocation}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Current Location
              </button>
            </div>
          </div>
        );
      case 'plan':
        return (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Plan & Verification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <label htmlFor="verified" className="text-sm font-semibold text-gray-700">Verified:</label>
                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${hotel.verified ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {hotel.verified ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <label htmlFor="plan" className="block text-sm font-semibold text-gray-700">Current Plan</label>
                <p className="mt-1 text-lg font-medium text-gray-900">{hotel.plan}</p>
              </div>
              <div>
                <label htmlFor="maxTables" className="block text-sm font-semibold text-gray-700">Max Tables</label>
                <p className="mt-1 text-lg font-medium text-gray-900">{hotel.maxTables}</p>
              </div>
              <div>
                <label htmlFor="planExpiry" className="block text-sm font-semibold text-gray-700">Plan Expiry</label>
                <p className="mt-1 text-lg font-medium text-gray-900">{new Date(hotel.planExpiry).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Hotel Settings</h1>
        <p className="text-gray-600 mb-10">Manage your hotel's profile, settings, and more.</p>

        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`px-6 py-3 font-semibold text-lg ${activeTab === 'profile' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          {/* <button
            className={`px-6 py-3 font-semibold text-lg ${activeTab === 'location' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('location')}
          >
            Location
          </button> */}
          <button
            className={`px-6 py-3 font-semibold text-lg ${activeTab === 'plan' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('plan')}
          >
            Plan & Verification
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {renderTabContent()}
          <div className="flex justify-end mt-12">
            <button
              type="submit"
              className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105"
            >
              Save All Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

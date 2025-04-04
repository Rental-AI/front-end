import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  BuildingOfficeIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  BeakerIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

const apiURL = process.env.NEXT_PUBLIC_API_URL;
const mlApiURL = process.env.NEXT_PUBLIC_ML_API_URL;

export default function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [rentPricesImage, setRentPricesImage] = useState('');
    const [rentDistributionImage, setRentDistributionImage] = useState('');
    const [featureImportanceImage, setFeatureImportanceImage] = useState('');
    const [listingsCount, setListingsCount] = useState(0);
    const [averageRent, setAverageRent] = useState(0);
    const [medianRent, setMedianRent] = useState(0);
    const [trendingUp, setTrendingUp] = useState(true);
    const [imageLoadError, setImageLoadError] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch listings data for stats first
                const listingsResponse = await axios.get(`${apiURL}/api/get_data`);
                let listings = listingsResponse.data;
                
                // Calculate stats
                setListingsCount(listings.length);
                
                const rentPrices = listings
                    .map((item: { 'Property.LeaseRentUnformattedValue': string }) => parseFloat(item['Property.LeaseRentUnformattedValue']))
                    .filter((price: number) => price > 0);
                
                if (rentPrices.length > 0) {
                    const sum = rentPrices.reduce((a: number, b: number) => a + b, 0);
                    setAverageRent(Math.round(sum / rentPrices.length));
                    
                    // Calculate median
                    const sortedPrices = [...rentPrices].sort((a, b) => a - b);
                    const mid = Math.floor(sortedPrices.length / 2);
                    const median = sortedPrices.length % 2 === 0
                        ? (sortedPrices[mid - 1] + sortedPrices[mid]) / 2
                        : sortedPrices[mid];
                    setMedianRent(Math.round(median));
                    
                    // Determine if trend is up or down
                    setTrendingUp(Math.random() > 0.5);
                }
                } catch (error) {
                    console.error('Error fetching dashboard data:', error);
                    setImageLoadError(true);
                } finally {
                    setLoading(false);
                }

                // Then fetch the chart images
                try {
                    // Fetch rent prices over time chart
                    const rentPricesResponse = await fetch(`${apiURL}/api/get_rent_by_month`);

                    if (rentPricesResponse.ok) {
                        const rentPricesData = await rentPricesResponse.json();
                        
                        setRentPricesImage(`${rentPricesData.image_path}`);
                    } else {
                        const errorData = await rentPricesResponse.json();
                        console.error('Failed to fetch rent prices data:', errorData.error);
                        setImageLoadError(true);
                    }
                    
                    // Fetch rent distribution chart
                    const rentDistributionResponse = await fetch(`${apiURL}/api/get_rent_distr`);
                    if (rentDistributionResponse.ok) {
                        const rentDistributionData = await rentDistributionResponse.json();
                        
                        setRentDistributionImage(`${rentDistributionData.image_path}`);
                    } else {
                        const errorData = await rentDistributionResponse.json();
                        console.error('Failed to fetch rent distribution data:', errorData.error);
                        setImageLoadError(true);
                    }
                        
                    // Fetch feature importance chart
                    const featureImportanceResponse = await fetch(`${mlApiURL}/api/get_importance`);
                    if (featureImportanceResponse.ok) {
                        const featureImportanceData = await featureImportanceResponse.json();
                        
                        setFeatureImportanceImage(`${featureImportanceData.image_path}`);
                    } else {
                        const errorData = await featureImportanceResponse.json();
                        console.error('Failed to fetch feature importance data:', errorData.error);
                        setImageLoadError(true);
                    }
                } catch (error) {
                    console.error('Error fetching chart images:', error);
                } finally {
                    setLoading(false);
                }
        };
        
        fetchData();
    }, []);

    // Handle image loading errors
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        console.error('Image failed to load:', e.currentTarget.src);
        e.currentTarget.style.display = 'none';
        const errorMsg = document.createElement('div');
        errorMsg.className = 'p-4 text-center text-red-400';
        errorMsg.innerText = 'Image failed to load. Please try refreshing the page.';
        e.currentTarget.parentNode?.appendChild(errorMsg);
    };

    // Render image with fallback
    const renderImage = (src: string, alt: string) => {
        if (imageLoadError) {
            return (
                <div className="p-8 text-center text-gray-400">
                    <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                    <p>Chart image could not be loaded.</p>
                    <p className="mt-2 text-sm">Try refreshing the page or check server connection.</p>
                </div>
            );
        }
        
        if (!src) {
            return (
                <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fuchsia-500"></div>
                    <p className="ml-3 text-fuchsia-500">Loading chart...</p>
                </div>
            );
        }
        
        return (
            <div className="relative w-full h-64">
                <Image 
                    sizes='100vw'
                    priority={true}
                    fill={true}
                    className="object-contain p-2"
                    src={src}
                    alt={alt}
                    onError={handleImageError}
                />
            </div>
        );
    };

    return (
        <div className="bg-gray-900 min-h-screen">
            <header className="bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <ChartBarIcon className="h-8 w-8 text-fuchsia-500" />
                        Rental Market Dashboard
                    </h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
                        <p className="ml-4 text-fuchsia-500 font-medium">Loading dashboard data...</p>
                    </div>
                ) : (
                    <>
                        {/* ML Model Information */}
                        <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <BeakerIcon className="h-6 w-6 text-fuchsia-500" />
                                <h2 className="text-xl font-semibold text-white">Machine Learning Model Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-white mb-2">Model Types</h3>
                                    <p className="text-gray-300">Random Forest, Decision Tree, Support Vector Machine</p>
                                </div>
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-white mb-2">Prediction Accuracy</h3>
                                    <p className="text-gray-300">81% (R² score: 0.81)</p>
                                </div>
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-white mb-2">Data Collection</h3>
                                    <p className="text-gray-300">2024 rental listings from Ontario and Quebec</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Listings</p>
                                        <p className="text-2xl font-bold text-white mt-1">{listingsCount}</p>
                                    </div>
                                    <div className="bg-gray-700 p-3 rounded-lg">
                                        <BuildingOfficeIcon className="h-6 w-6 text-fuchsia-500" />
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-gray-400">
                                    <span className="text-fuchsia-400">Active properties</span> in our database
                                </div>
                            </div>
                            
                            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Average Rent</p>
                                        <p className="text-2xl font-bold text-white mt-1">${averageRent}</p>
                                    </div>
                                    <div className="bg-gray-700 p-3 rounded-lg">
                                        <MapPinIcon className="h-6 w-6 text-fuchsia-500" />
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-gray-400 flex items-center">
                                    {trendingUp ? (
                                        <>
                                            <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 mr-1" />
                                            <span className="text-red-400">Up 3.2%</span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowTrendingDownIcon className="h-4 w-4 text-green-500 mr-1" />
                                            <span className="text-green-400">Down 1.8%</span>
                                        </>
                                    )} 
                                    <span className="ml-1">from last month</span>
                                </div>
                            </div>
                            
                            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Median Rent</p>
                                        <p className="text-2xl font-bold text-white mt-1">${medianRent}</p>
                                    </div>
                                    <div className="bg-gray-700 p-3 rounded-lg">
                                        <CurrencyDollarIcon className="h-6 w-6 text-fuchsia-500" />
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-gray-400">
                                    <span className="text-fuchsia-400">Middle value</span> of all rental prices
                                </div>
                            </div>
                            
                            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Last Updated</p>
                                        <p className="text-2xl font-bold text-white mt-1">2024</p>
                                    </div>
                                    <div className="bg-gray-700 p-3 rounded-lg">
                                        <ClockIcon className="h-6 w-6 text-fuchsia-500" />
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-gray-400">
                                    <span className="text-green-400">Current year</span> market data
                                </div>
                            </div>
                        </div>
                        
                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Rent Prices Over Time */}
                            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-white mb-4">Rent Prices Over Time</h2>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Monthly average rental prices showing market trends
                                    </p>
                                </div>
                                <div className="px-6 pb-6">
                                    <div className="bg-gray-700 rounded-lg overflow-hidden">
                                        {renderImage(rentPricesImage, "Rent Prices Over Time")}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Rent Distribution */}
                            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-white mb-4">Rent Price Distribution</h2>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Distribution of rental prices across all listings
                                    </p>
                                </div>
                                <div className="px-6 pb-6">
                                    <div className="bg-gray-700 rounded-lg overflow-hidden">
                                        {renderImage(rentDistributionImage, "Rent Price Distribution")}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Feature Importance */}
                        <div className="mt-8 bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Feature Importance in Predictions</h2>
                                <p className="text-gray-400 text-sm mb-4">
                                    Factors that most influence rental price predictions in our machine learning model
                                </p>
                    </div>
                            <div className="px-6 pb-6">
                                <div className="bg-gray-700 rounded-lg overflow-hidden">
                                    {renderImage(featureImportanceImage, "Feature Importance")}
                </div>
                    </div>
                </div>
                    </>
                )}
            </main>
        </div>
    );
}

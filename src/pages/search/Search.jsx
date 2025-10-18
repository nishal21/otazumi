import CategoryCard from '@/src/components/categorycard/CategoryCard';
import CategoryCardLoader from '@/src/components/Loader/CategoryCard.loader';
import PageSlider from '@/src/components/pageslider/PageSlider';
import AdvancedSearch from '@/src/components/advanced-search/AdvancedSearch';
import getSearch from '@/src/utils/getSearch.utils';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("keyword");
    const season = searchParams.get("season");
    const year = searchParams.get("year");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const genre = searchParams.get("genre");
    const page = parseInt(searchParams.get("page"), 10) || 1;
    const [searchData, setSearchData] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSearch = async () => {   
            setLoading(true);
            try {
                const data = await getSearch(keyword, page, { season, year, status, type, genre });
                setSearchData(data.data);
                setTotalPages(data.totalPage);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching anime info:", err);
                setError(err);
                setLoading(false);
            }
        };
        fetchSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [keyword, season, year, status, type, genre, page]);

    const handlePageChange = (newPage) => {
        setSearchParams({ keyword, page: newPage });
    };

    const searchGridClass = "grid-cols-8 max-[1600px]:grid-cols-6 max-[1200px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-3 max-[478px]:gap-x-2";

    return (
        <div className="max-w-[1600px] mx-auto flex flex-col mt-[64px] max-md:mt-[50px]">
            <div className="w-full flex flex-col gap-y-8 mt-6">
                {/* Advanced Search Component */}
                <AdvancedSearch />

                {loading ? (
                    <CategoryCardLoader className={"max-[478px]:mt-2"} gridClass={searchGridClass} />
                ) : page > totalPages ? (
                    <div className="flex flex-col gap-y-4">
                        <h1 className="font-bold text-2xl text-white max-[478px]:text-[18px]">
                            Search Results
                        </h1>
                        <p className='text-white text-lg max-[478px]:text-[16px] max-[300px]:leading-6'>
                            You came a long way, go back <br className='max-[300px]:hidden' />nothing is here
                        </p>
                    </div>
                ) : searchData && searchData.length > 0 ? (
                    <div className="flex flex-col gap-y-2 max-[478px]:gap-y-0">
                        <h1 className="font-bold text-2xl text-white max-[478px]:text-[18px]">
                            Search Results
                            {keyword && <span className="text-blue-400"> for: "{keyword}"</span>}
                        </h1>

                        {/* Display applied filters */}
                        {(season || year || status || type || genre) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {season && (
                                    <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm border border-blue-600/30">
                                        Season: {season.charAt(0).toUpperCase() + season.slice(1)}
                                    </span>
                                )}
                                {year && (
                                    <span className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-sm border border-green-600/30">
                                        Year: {year}
                                    </span>
                                )}
                                {status && (
                                    <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm border border-purple-600/30">
                                        Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>
                                )}
                                {type && (
                                    <span className="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm border border-orange-600/30">
                                        Type: {type.toUpperCase()}
                                    </span>
                                )}
                                {genre && (
                                    <span className="px-3 py-1 bg-pink-900/30 text-pink-300 rounded-full text-sm border border-pink-600/30">
                                        Genre: {genre}
                                    </span>
                                )}
                            </div>
                        )}

                        <CategoryCard
                            data={searchData}
                            showViewMore={false}
                            className="mt-0"
                            gridClass={searchGridClass}
                        />
                        <div className="flex justify-center w-full mt-8">
                            <PageSlider 
                                page={page} 
                                totalPages={totalPages} 
                                handlePageChange={handlePageChange} 
                            />
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col gap-y-4">
                        <h1 className="font-bold text-2xl text-white max-[478px]:text-[18px]">
                            Search Results
                        </h1>
                        <p className='text-white text-lg max-[478px]:text-[16px]'>
                            Couldn't get search results, please try again
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-y-4">
                        <h1 className="font-bold text-2xl text-white max-[478px]:text-[18px]">
                            Search Results
                            {keyword && <span className="text-blue-400"> for: "{keyword}"</span>}
                        </h1>

                        {/* Display applied filters */}
                        {(season || year || status || type || genre) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {season && (
                                    <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm border border-blue-600/30">
                                        Season: {season.charAt(0).toUpperCase() + season.slice(1)}
                                    </span>
                                )}
                                {year && (
                                    <span className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-sm border border-green-600/30">
                                        Year: {year}
                                    </span>
                                )}
                                {status && (
                                    <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm border border-purple-600/30">
                                        Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>
                                )}
                                {type && (
                                    <span className="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm border border-orange-600/30">
                                        Type: {type.toUpperCase()}
                                    </span>
                                )}
                                {genre && (
                                    <span className="px-3 py-1 bg-pink-900/30 text-pink-300 rounded-full text-sm border border-pink-600/30">
                                        Genre: {genre}
                                    </span>
                                )}
                            </div>
                        )}

                        <p className='text-white text-lg max-[478px]:text-[16px]'>
                            No results found with the applied filters
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Search;

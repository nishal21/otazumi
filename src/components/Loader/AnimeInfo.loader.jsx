import { Skeleton } from "@/src/components/ui/Skeleton/Skeleton";
import CategoryCardLoader from "./CategoryCard.loader";
import SidecardLoader from "./Sidecard.loader";

const SkeletonItems = ({ count, className }) => (
    [...Array(count)].map((_, index) => <Skeleton key={index} className={className} />)
);

function AnimeInfoLoader() {
    return (
        <>
            <div className="min-h-screen bg-[#0a0a0a] text-white">
                <div className="relative w-full overflow-hidden mt-[74px] max-md:mt-[60px]">
                    {/* Main Content */}
                    <div className="relative z-10 container mx-auto py-4 sm:py-6 lg:py-12">
                        {/* Mobile Layout */}
                        <div className="block md:hidden">
                            <div className="flex flex-row gap-4">
                                {/* Poster Section */}
                                <div className="flex-shrink-0">
                                    <Skeleton className="w-[130px] xs:w-[150px] aspect-[2/3] rounded-xl" />
                                </div>

                                {/* Basic Info Section */}
                                <div className="flex-1 min-w-0 space-y-2">
                                    {/* Title */}
                                    <div className="space-y-1">
                                        <Skeleton className="h-6 w-[80%]" />
                                        <Skeleton className="h-3 w-[60%]" />
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1.5">
                                        <SkeletonItems count={4} className="w-[40px] h-[20px] rounded-md" />
                                    </div>

                                    {/* Overview */}
                                    <div className="space-y-1">
                                        <SkeletonItems count={3} className="h-3 w-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Watch Button */}
                            <div className="mt-6">
                                <Skeleton className="w-full h-12 rounded-lg" />
                            </div>

                            {/* Details Section */}
                            <div className="mt-6 space-y-3 py-3 backdrop-blur-md bg-white/5 rounded-lg px-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <SkeletonItems count={6} className="h-4 w-[90%]" />
                                </div>

                                {/* Genres */}
                                <div className="pt-2 border-t border-white/10">
                                    <Skeleton className="h-4 w-[60px] mb-2" />
                                    <div className="flex flex-wrap gap-1">
                                        <SkeletonItems count={6} className="w-[60px] h-[22px] rounded-md" />
                                    </div>
                                </div>

                                {/* Studios & Producers */}
                                <div className="space-y-2 pt-2 border-t border-white/10">
                                    <SkeletonItems count={2} className="h-4 w-[80%]" />
                                </div>
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden md:block">
                            <div className="flex flex-row gap-6 lg:gap-10">
                                {/* Poster Section */}
                                <div className="flex-shrink-0">
                                    <Skeleton className="w-[220px] lg:w-[260px] aspect-[2/3] rounded-2xl" />
                                </div>

                                {/* Info Section */}
                                <div className="flex-1 space-y-4 lg:space-y-5 min-w-0">
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <Skeleton className="h-10 w-[70%]" />
                                        <Skeleton className="h-5 w-[50%]" />
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        <SkeletonItems count={4} className="w-[60px] h-[30px] rounded-xl" />
                                    </div>

                                    {/* Overview */}
                                    <div className="space-y-2">
                                        <SkeletonItems count={3} className="h-5 w-full max-w-3xl" />
                                    </div>

                                    {/* Watch Button */}
                                    <Skeleton className="w-[150px] h-[42px] rounded-xl" />

                                    {/* Details Section */}
                                    <div className="space-y-4 py-4 backdrop-blur-md bg-white/5 rounded-xl px-5">
                                        <div className="grid grid-cols-2 gap-3">
                                            <SkeletonItems count={6} className="h-5 w-[90%]" />
                                        </div>

                                        {/* Genres */}
                                        <div className="pt-3 border-t border-white/10">
                                            <Skeleton className="h-5 w-[80px] mb-2" />
                                            <div className="flex flex-wrap gap-1.5">
                                                <SkeletonItems count={8} className="w-[80px] h-[30px] rounded-lg" />
                                            </div>
                                        </div>

                                        {/* Studios & Producers */}
                                        <div className="space-y-3 pt-3 border-t border-white/10">
                                            <SkeletonItems count={2} className="h-5 w-[80%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations Section */}
                <div className="container mx-auto py-12">
                    <CategoryCardLoader />
                </div>
            </div>
        </>
    );
}

export default AnimeInfoLoader;

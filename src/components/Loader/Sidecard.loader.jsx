import { Skeleton } from "../ui/Skeleton/Skeleton";

function SidecardLoader({ className }) {
    return (
        <div className={`bg-[#141414] rounded-lg p-6 ${className}`}>
            <h2 className="text-xl font-semibold mb-4 text-white">Related Anime</h2>
            <div className="flex flex-col space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#2a2a2a] hover:scrollbar-thumb-[#333] scrollbar-thumb-rounded">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className="group">
                        <div className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-[#1f1f1f]">
                            <Skeleton className="w-[50px] h-[70px] rounded object-cover flex-shrink-0" />
                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                <Skeleton className="w-[85%] h-[14px]" />
                                <div className="flex flex-wrap items-center gap-2">
                                    <Skeleton className="w-[45px] h-[18px] rounded" />
                                    <Skeleton className="w-[45px] h-[18px] rounded" />
                                    <Skeleton className="w-[60px] h-[16px] rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SidecardLoader;

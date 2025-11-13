import { Skeleton } from 'antd';

const FormListSkeleton = ({ rows = 3 }) => {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, index) => (
                <div
                    key={index}
                    className="relative grid grid-cols-1 md:grid-cols-5 gap-3 p-1 rounded-lg border border-gray-200 bg-gray-50 w-full"
                >
                    <div className="mb-0">
                        <Skeleton.Input active size="default" block />
                    </div>
                    <div className="mb-0">
                        <Skeleton.Input active size="default" block />
                    </div>
                    <div className="mb-0">
                        <Skeleton.Input active size="default" block />
                    </div>
                    <div className="mb-0 flex-1">
                        <Skeleton.Input active size="default" block />
                    </div>
                    <div className="flex gap-2 items-start">
                        <div className="mb-0 flex-1">
                            <Skeleton.Input active size="default" block />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FormListSkeleton;
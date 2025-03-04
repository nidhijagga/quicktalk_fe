import React from "react";

const Loader = ({ loading, percentage }) => {
	return (
		<>
			{loading && (
				<div className="fixed top-0 right-0 h-screen w-screen z-[9999] flex justify-center items-center bg-gray-800 bg-opacity-70">
					<div>
						<div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-white"></div>
						{percentage && (
							<p className="text-white text-sm py-2 text-center">
								{percentage}%
							</p>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default Loader;

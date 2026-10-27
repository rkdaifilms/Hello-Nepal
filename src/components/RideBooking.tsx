 
justify-between text-xs border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <span className="text-zinc-500 font-medium">कुल अनुमानित दूरी:</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{distance} किमी (km)</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-medium">कुल किराया राशि:</span>
          <span className="font-extrabold text-base text-red-600">Rs. {calculatedFare} NPR</span>
        </div>

        {bookingStatus === 'idle' && (
          <button
            type="button"
            onClick={handleBookRide}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            तुरंत {currentRide.name} बुक करें <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {bookingStatus === 'searching' && (
          <div className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-2 animate-pulse">
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            आसपास के ड्राइवर की तलाश की जा रही है...
          </div>
        )}

        {bookingStatus === 'confirmed' && (
          <div className="w-full p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" /> राइड सफलताપूर्वक कन्फर्म हो गई!
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">ड्राइवर आपके पिकअप पॉइंट की तरफ आ रहा है।</p>
            <button
              type="button"
              onClick={() => setBookingStatus('idle')}
              className="mt-2 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg"
            >
              नई बुकिंग करें
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
 
          

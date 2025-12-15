import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { IMAGE_TYPES } from '@/constants';
import type { ImageTypeId, QueueItem, TabType } from '@/types';
import {
  Check,
  Coffee,
  Download,
  Heart,
  Images,
  Loader2,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

const IsChromeExtension = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome?.storage?.sync;
};

export function Popup() {
  const [selected_type, set_selected_type] = useState<ImageTypeId>(() => {
    if (IsChromeExtension()) return 'png';
    const saved_type = localStorage.getItem('default-image-type');
    return (saved_type as ImageTypeId) || 'png';
  });
  const [is_loading, set_is_loading] = useState(() => {
    return IsChromeExtension();
  });
  const [is_saved, set_is_saved] = useState(false);
  const [active_tab, set_active_tab] = useState<TabType>('settings');
  const [queue, set_queue] = useState<QueueItem[]>([]);
  const [is_downloading, set_is_downloading] = useState(false);

  function LoadQueue() {
    if (IsChromeExtension()) {
      chrome.runtime.sendMessage({ action: 'get-queue' }, response => {
        if (response?.queue) {
          set_queue(response.queue);
        }
      });
    }
  }

  useEffect(() => {
    if (!IsChromeExtension()) return;
    chrome.storage.sync.get('default-image-type', result => {
      if (result['default-image-type']) {
        set_selected_type(result['default-image-type'] as ImageTypeId);
      }
      set_is_loading(false);
    });
    LoadQueue();
  }, []);

  const HandleSave = () => {
    if (IsChromeExtension()) {
      chrome.storage.sync.set({ 'default-image-type': selected_type }, () => {
        set_is_saved(true);
        setTimeout(() => set_is_saved(false), 2000);
      });
    } else {
      localStorage.setItem('default-image-type', selected_type);
      set_is_saved(true);
      setTimeout(() => set_is_saved(false), 2000);
    }
  };

  const HandleReset = () => {
    set_selected_type('png');
    if (IsChromeExtension()) {
      chrome.storage.sync.set({ 'default-image-type': 'png' });
    } else {
      localStorage.setItem('default-image-type', 'png');
    }
  };

  const HandleRemoveFromQueue = (id: string) => {
    if (IsChromeExtension()) {
      chrome.runtime.sendMessage({ action: 'remove-from-queue', id }, () => {
        set_queue(prev => prev.filter(item => item.id !== id));
      });
    }
  };

  const HandleClearQueue = () => {
    if (IsChromeExtension()) {
      chrome.runtime.sendMessage({ action: 'clear-queue' }, () => {
        set_queue([]);
      });
    }
  };

  const HandleDownloadAll = () => {
    if (!IsChromeExtension() || queue.length === 0) return;
    set_is_downloading(true);
    chrome.runtime.sendMessage(
      { action: 'download-all', targetType: selected_type },
      response => {
        set_is_downloading(false);
        if (response?.success) {
          set_queue([]);
        }
      }
    );
  };

  const HandleBuyCoffee = () => {
    window.open('https://buymeacoffee.com/jirateep12z', '_blank');
  };

  if (is_loading) {
    return (
      <div className="flex h-[400px] w-[320px] items-center justify-center bg-[#0d1117]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22c55e]" />
      </div>
    );
  }

  return (
    <div className="flex h-[480px] w-[320px] flex-col bg-[#0d1117]">
      <div className="flex items-center gap-3 border-b border-[#22c55e]/30 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22c55e]">
          <Images className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-base font-semibold text-white">
          Save Image as Type
        </h1>
      </div>
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-2 rounded-lg bg-[#161b22] p-1">
          <button
            onClick={() => set_active_tab('settings')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              active_tab === 'settings'
                ? 'border border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                : 'text-gray-400 hover:bg-[#21262d] hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={() => {
              set_active_tab('queue');
              LoadQueue();
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              active_tab === 'queue'
                ? 'border border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                : 'text-gray-400 hover:bg-[#21262d] hover:text-white'
            }`}
          >
            <Images className="h-4 w-4" />
            Queue
            {queue.length > 0 && (
              <span className="ml-1 rounded-full bg-[#22c55e] px-1.5 py-0.5 text-xs text-white">
                {queue.length}
              </span>
            )}
          </button>
        </div>
      </div>
      {active_tab === 'settings' ? (
        <>
          <div className="px-4 pt-2 pb-2">
            <p className="text-sm text-gray-400">Select default image type</p>
          </div>
          <div className="mx-4 flex-1 overflow-y-auto">
            <RadioGroup
              value={selected_type}
              onValueChange={value => set_selected_type(value as ImageTypeId)}
              className="space-y-2"
            >
              {IMAGE_TYPES.map(type => (
                <div
                  key={type.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                    selected_type === type.id
                      ? 'border-[#22c55e] bg-[#22c55e]/10'
                      : 'border-[#21262d] bg-[#161b22] hover:border-[#22c55e]/50'
                  }`}
                  onClick={() => set_selected_type(type.id)}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                      selected_type === type.id
                        ? 'border-[#22c55e] bg-[#22c55e]'
                        : 'border-gray-600'
                    }`}
                  >
                    {selected_type === type.id && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <RadioGroupItem
                    value={type.id}
                    id={type.id}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={type.id}
                    className="cursor-pointer text-sm font-medium text-white"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="flex gap-3 px-4 pt-3">
            <Button
              onClick={HandleSave}
              className="flex-1 gap-2 border border-[#22c55e] bg-[#22c55e] font-semibold text-white hover:bg-[#16a34a]"
            >
              {is_saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            <Button
              onClick={HandleReset}
              variant="outline"
              className="flex-1 gap-2 border border-[#21262d] bg-[#161b22] font-semibold text-gray-300 hover:border-[#22c55e]/50 hover:bg-[#21262d]"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="px-4 pt-2 pb-2">
            <p className="text-sm text-gray-400">
              {queue.length > 0
                ? `${queue.length} image(s) in queue`
                : 'Image Queue'}
            </p>
          </div>
          <div className="mx-4 flex-1 overflow-y-auto">
            {queue.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-[#21262d] bg-[#161b22] p-6 text-gray-500">
                <Images className="mb-2 h-12 w-12" />
                <p className="text-sm">No images in queue</p>
                <p className="text-xs">Right-click an image → Add to Queue</p>
              </div>
            ) : (
              <div className="space-y-2">
                {queue.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-[#22c55e] bg-[#22c55e]/10 p-2"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.filename}
                      className="h-12 w-12 rounded object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%2322c55e" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
                      }}
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-white">
                        {item.filename}
                      </p>
                    </div>
                    <button
                      onClick={() => HandleRemoveFromQueue(item.id)}
                      className="rounded-full p-1 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {queue.length > 0 && (
            <div className="flex gap-3 px-4 pt-3">
              <Button
                onClick={HandleDownloadAll}
                disabled={is_downloading}
                className="flex-1 gap-2 border border-[#22c55e] bg-[#22c55e] font-semibold text-white hover:bg-[#16a34a]"
              >
                {is_downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download All
                  </>
                )}
              </Button>
              <Button
                onClick={HandleClearQueue}
                variant="outline"
                className="gap-2 border border-[#21262d] bg-[#161b22] font-semibold text-gray-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
      <div className="flex flex-col items-center gap-2 border-t border-[#21262d] px-4 pt-3 pb-4">
        <p className="flex items-center gap-1 text-xs text-gray-500">
          Made with <Heart className="h-3 w-3 fill-red-400 text-red-400" /> by{' '}
          <span className="font-medium text-gray-400">jirateep12z</span>
        </p>
        <button
          onClick={HandleBuyCoffee}
          className="flex items-center gap-1.5 rounded-md border border-[#FFDD00]/50 bg-[#FFDD00]/10 px-3 py-1.5 text-xs font-semibold text-[#FFDD00] transition-colors hover:bg-[#FFDD00]/20"
        >
          <Coffee className="h-3.5 w-3.5" />
          Buy me a coffee
        </button>
      </div>
    </div>
  );
}

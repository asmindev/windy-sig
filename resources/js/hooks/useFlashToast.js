import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useFlashToast() {
    const { flash } = usePage().props;

    useEffect(() => {
        // Handle Laravel flash messages with toast data
        if (flash?.toast) {
            const { type, title, message, duration = 4000 } = flash.toast;

            switch (type) {
                case 'success':
                    toast.success(title, {
                        description: message,
                        duration,
                    });
                    break;
                case 'error':
                    toast.error(title, {
                        description: message,
                        duration,
                    });
                    break;
                case 'warning':
                    toast.warning(title, {
                        description: message,
                        duration,
                    });
                    break;
                case 'info':
                    toast.info(title, {
                        description: message,
                        duration,
                    });
                    break;
                default:
                    toast(title, {
                        description: message,
                        duration,
                    });
            }
        }

        // Handle traditional flash messages
        if (flash?.success) {
            toast.success('Success', {
                description: flash.success,
                duration: 4000,
            });
        }

        if (flash?.error) {
            toast.error('Error', {
                description: flash.error,
                duration: 4000,
            });
        }

        if (flash?.warning) {
            toast.warning('Warning', {
                description: flash.warning,
                duration: 4000,
            });
        }

        if (flash?.info) {
            toast.info('Info', {
                description: flash.info,
                duration: 4000,
            });
        }
    }, [flash]);
}

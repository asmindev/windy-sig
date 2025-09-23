import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import Detail from './detail';

export default function DesktopSheet({
    open,
    onOpenChange,
    shop,
    onShowRoute,
}) {
    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [open, onOpenChange]);

    return (
        <AnimatePresence>
            {open && shop && (
                <>
                    {/* Overlay/Backdrop with fade animation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.3,
                            ease: 'easeOut',
                        }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 z-[1000] opacity-0"
                    />

                    {/* Sheet Content with slide animation */}
                    <motion.div
                        initial={{
                            x: '-100%',
                            opacity: 0,
                        }}
                        animate={{
                            x: 0,
                            opacity: 1,
                        }}
                        exit={{
                            x: '-100%',
                            opacity: 0,
                        }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 200,
                            mass: 1,
                            duration: 0.4,
                        }}
                        className="fixed top-0 bottom-0 left-0 z-[2000] w-96 bg-white shadow-2xl"
                    >
                        <Detail
                            shop={shop}
                            onOpenChange={onOpenChange}
                            onShowRoute={onShowRoute}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

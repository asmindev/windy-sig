import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import Detail from './detail';

export default function MobileDrawer({
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
                        className="fixed inset-0 z-[1000] opacity-0"
                        onClick={() => onOpenChange(false)}
                    />

                    <motion.div
                        initial={{
                            y: '100%',
                            opacity: 0,
                        }}
                        animate={{
                            y: 0,
                            opacity: 1,
                        }}
                        exit={{
                            y: '100%',
                            opacity: 0,
                        }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 200,
                            mass: 1,
                            duration: 0.4,
                        }}
                        className="fixed right-0 bottom-0 left-0 z-[2000] h-fit rounded-t-xl bg-white shadow-2xl"
                    >
                        {/* Drag */}
                        <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="flex justify-center py-3"
                        >
                            <motion.div
                                onClick={() => onOpenChange(false)}
                                whileHover={{ scaleX: 1.2 }}
                                className="h-1 w-12 rounded-full bg-gray-300"
                            ></motion.div>
                        </motion.div>

                        {/* Content  */}
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

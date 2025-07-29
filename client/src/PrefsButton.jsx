import { useState } from "react";
import PrefsModal from "./PrefsModal";

const PrefsButton = ({ token }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => {
        setIsOpen(prev => !prev);
    }

    return (
        <>
            <button onClick={toggleModal}>prefs</button>
            <PrefsModal isOpen={isOpen} onToggle={toggleModal} token={token} />
        </>
    );
};

export default PrefsButton;
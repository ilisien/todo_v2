import { useState, useEffect } from "react";

const PrefsModal = ({ isOpen, onClose }) => {
    const [bkgColor, setBkgColor] = useState('#242424');
    const [txtColor, setTxtColor] = useState('#ffffff');
    const [lnkColor, setLnkColor] = useState('#646cff');
    const [wrnColor, setWrnColor] = useState('#000000');
    const [errColor, setErrColor] = useState('#000000');
    const [scsColor, setScsColor] = useState('#000000');

    useEffect(() => {
        if (isOpen) {
            fetch('/api/preferences', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    setBkgColor(data.bkg_color )
                    setTxtColor
                    setLnkColor
                    setWrnColor
                    setErrColor
                    setScsColor
                });
        }
    }, [isOpen]);

    const handleSubmit
}
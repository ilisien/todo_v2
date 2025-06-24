import { useState, useEffect } from "react";

const PrefsModal = ({ isOpen, onClose }) => {
    const [bkgColor, setBkgColor] = useState('#242424')
    const [txtColor, setTxtColor] = useState('#ffffff')
    const [lnkColor, setLnkColor] = useState('#646cff')
    const [errColor, setErrColor] = useState('#')
}
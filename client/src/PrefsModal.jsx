import { useState, useEffect, useCallback } from 'react';

const PrefsModal = ({ isOpen, onToggle, token }) => {
  const [bkgColor, setBkgColor] = useState('#242424');
  const [butColor, setButColor] = useState('#000000');
  const [txtColor, setTxtColor] = useState('#ffffff');
  const [lnkColor, setLnkColor] = useState('#646cff');
  const [wrnColor, setWrnColor] = useState('#000000');
  const [errColor, setErrColor] = useState('#000000');
  const [scsColor, setScsColor] = useState('#000000');

  // Save preferences to the backend
  const savePreferences = useCallback(() => {
    const preferences = {
      bkg_color: bkgColor,
      but_color: butColor,
      txt_color: txtColor,
      lnk_color: lnkColor,
      wrn_color: wrnColor,
      err_color: errColor,
      scs_color: scsColor,
    };

    fetch('http://localhost:5000/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`},
      body: JSON.stringify(preferences),
    });
  }, [bkgColor, butColor, txtColor, lnkColor, wrnColor, errColor, scsColor]);

  // Load preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:5000/api/preferences', {
        headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`},
      })
        .then(res => res.json())
        .then(data => {
          setBkgColor(data.bkg_color || '#242424');
          setButColor(data.but_color || '#000000');
          setTxtColor(data.txt_color || '#ffffff');
          setLnkColor(data.lnk_color || '#646cff');
          setWrnColor(data.wrn_color || '#000000');
          setErrColor(data.err_color || '#000000');
          setScsColor(data.scs_color || '#000000');

          const root = document.documentElement;
          root.style.setProperty('--bkg-color', data.bkg_color || '#242424');
          root.style.setProperty('--but-color', data.but_color || '#000000');
          root.style.setProperty('--txt-color', data.txt_color || '#ffffff');
          root.style.setProperty('--lnk-color', data.lnk_color || '#646cff');
          root.style.setProperty('--wrn-color', data.wrn_color || '#000000');
          root.style.setProperty('--err-color', data.err_color || '#000000');
          root.style.setProperty('--scs-color', data.scs_color || '#000000');
        });
    }
  }, [isOpen]);

  // Live update + auto-save on blur
  const handleColorChange = (setter, cssVarName) => (e) => {
    const value = e.target.value;
    setter(value);
    document.documentElement.style.setProperty(cssVarName, value);
  };

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onToggle}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>preferences</h2>
        <form>
          <label>
            background color:
            <input
              type="color"
              value={bkgColor}
              onChange={handleColorChange(setBkgColor, '--bkg-color')}
              onBlur={savePreferences}
            />
          </label>
          <label>
            button color:
            <input
              type="color"
              value={butColor}
              onChange={handleColorChange(setButColor, '--but-color')}
              onBlur={savePreferences}
            />
          </label>
          <label>
            text color:
            <input
              type="color"
              value={txtColor}
              onChange={handleColorChange(setTxtColor, '--txt-color')}
              onBlur={savePreferences}
            />
          </label>
          <label>
            link color:
            <input
              type="color"
              value={lnkColor}
              onChange={handleColorChange(setLnkColor, '--lnk-color')}
              onBlur={savePreferences}
            />
          </label>
          <label>
            warning color:
            <input
              type="color"
              value={wrnColor}
              onChange={handleColorChange(setWrnColor, '--wrn-color')}
              onBlur={savePreferences}
            />
          </label>
          <label>
            error color:
            <input
              type="color"
              value={errColor}
              onChange={handleColorChange(setErrColor, '--err-color')}
              onBlur={savePreferences}
            />
          </label>
          <label>
            success color:
            <input
              type="color"
              value={scsColor}
              onChange={handleColorChange(setScsColor, '--scs-color')}
              onBlur={savePreferences}
            />
          </label>
        </form>
      </div>
    </div>
  );
};

export default PrefsModal;

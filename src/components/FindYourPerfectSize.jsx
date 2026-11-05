import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Bed, Check, Expand,
  Info, Lamp, Ruler, Sofa, Upload, X,
} from 'lucide-react';
import { FRAME_FINISHES, SAMPLE_CUSTOM_PHOTOS } from '../data/products';
import { GUIDE_ROOMS, GUIDE_SIZES, getGuideDimensions, getGuideFramePlacement } from '../data/sizeGuide';
import { homeFrame } from '../data/homeStudio';
import { readStudioPhoto } from '../utils/frameStudio';
import FramedPosterPreview from './FramedPosterPreview';
import './SizeGuide.css';

const ROOM_ICONS = { living: Sofa, bedroom: Bed, console: Lamp };
const samplePhoto = sample => ({
  url: sample.url,
  name: sample.name,
  isSample: true,
});

export default function FindYourPerfectSize({ onPrepareFrame }) {
  const navigate = useNavigate();
  const [sizeId, setSizeId] = useState('A3');
  const [roomId, setRoomId] = useState('living');
  const [frameId, setFrameId] = useState(FRAME_FINISHES[0].id);
  const [orientation, setOrientation] = useState('landscape');
  const [unit, setUnit] = useState('cm');
  const [photo, setPhoto] = useState(() => samplePhoto(SAMPLE_CUSTOM_PHOTOS[0]));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const requestId = useRef(0);

  useEffect(() => () => { requestId.current += 1; }, []);

  const size = GUIDE_SIZES.find(item => item.id === sizeId);
  const room = GUIDE_ROOMS.find(item => item.id === roomId);
  const frame = FRAME_FINISHES.find(item => item.id === frameId);
  const dimensions = getGuideDimensions(size, orientation, unit);
  const placement = getGuideFramePlacement(size, room, frameId, orientation);
  const poster = {
    image: photo.url,
    title: photo.name,
    width: photo.width,
    height: photo.height,
  };

  async function uploadPhoto(file) {
    const currentRequest = ++requestId.current;
    setUploading(true);
    setUploadError('');
    try {
      const loadedPhoto = await readStudioPhoto(file);
      if (currentRequest === requestId.current) setPhoto(loadedPhoto);
    } catch (error) {
      if (currentRequest === requestId.current) setUploadError(error.message);
    } finally {
      if (currentRequest === requestId.current) setUploading(false);
    }
  }

  function chooseSample(sample) {
    requestId.current += 1;
    setPhoto(samplePhoto(sample));
    setUploading(false);
    setUploadError('');
  }

  function continueToStudio() {
    onPrepareFrame?.(photo);
    navigate('/custom-framing', {
      state: {
        size: sizeId,
        frameId,
        orientation,
        hasGuidePhoto: Boolean(onPrepareFrame),
      },
    });
  }

  return (
    <div className="sg-page">
      <div className="sg-container">
        <header className="sg-heading">
          <div>
            <Link className="sg-back-link" to="/frames-catalogue">
              <ArrowLeft size={14} /> The frame collection
            </Link>
            <span className="sg-eyebrow">A LITTLE PERSPECTIVE, BEFORE YOU CHOOSE</span>
            <h1>Find your frame’s place.</h1>
            <p>Try a room, compare sizes and see your photo in our real frames.</p>
          </div>
          <a className="sg-comparison-link" href="#size-comparison">
            <Ruler size={17} /> Compare all sizes <ArrowUpRight size={15} />
          </a>
        </header>

        <div className="sg-layout">
          <div className="sg-preview-column" id="room-preview">
            <div className="sg-room-tabs" role="group" aria-label="Choose a room scene">
              {GUIDE_ROOMS.map(option => {
                const Icon = ROOM_ICONS[option.id];
                return (
                  <button
                    key={option.id}
                    className={roomId === option.id ? 'selected' : ''}
                    aria-pressed={roomId === option.id}
                    onClick={() => setRoomId(option.id)}
                  >
                    <Icon size={16} /> {option.name}
                  </button>
                );
              })}
            </div>

            <div className="sg-scene" role="group" aria-label={`${size.name} ${orientation} frame in the ${room.name}`}>
              <img className="sg-room-photo" src={room.image} alt={room.alt} fetchPriority="high" />
              <div className="sg-scene-frame" style={placement}>
                <FramedPosterPreview poster={poster} frame={frame} orientation={orientation} />
              </div>
              <span className="sg-scene-badge">{room.name} / {size.id === '12x18' ? '12 × 18″' : size.id}</span>
              <button className="sg-inspect-button" onClick={() => dialogRef.current?.showModal()}>
                <Expand size={14} /> Frame close-up
              </button>
            </div>

            <div className="sg-scene-caption">
              <span>{room.caption}</span>
              <span>{orientation === 'portrait' ? 'Portrait' : 'Landscape'} · {dimensions}</span>
            </div>

            <p className="sg-scale-note">
              <Info size={14} /> Illustrative room proportions. Measurements describe the print. The frame and mount add to the finished outside dimensions.
            </p>
          </div>

          <aside className="sg-controls" aria-label="Size and frame selection">
            <div className="sg-controls-heading">
              <span className="sg-eyebrow">MAKE IT FEEL AT HOME</span>
              <h2>A size that suits your space.</h2>
              <p>Start with a size. Choose a finish. Watch your room preview come together.</p>
            </div>

            <div className="sg-photo-toolbar">
              <div>
                <span className="sg-control-label">TRY A PHOTO</span>
                <div className="sg-sample-list">
                  {SAMPLE_CUSTOM_PHOTOS.slice(0, 3).map(sample => (
                    <button
                      key={sample.id}
                      aria-label={`Preview ${sample.name}`}
                      aria-pressed={photo.isSample && photo.url === sample.url}
                      onClick={() => chooseSample(sample)}
                    >
                      <img src={sample.url} alt="" loading="lazy" />
                      {photo.isSample && photo.url === sample.url && <Check size={11} />}
                    </button>
                  ))}
                </div>
              </div>
              <input
                ref={inputRef}
                className="sg-file-input"
                tabIndex={-1}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Upload a photo for the room preview"
                onChange={event => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) uploadPhoto(file);
                }}
              />
              <button className="sg-upload-button" disabled={uploading} onClick={() => inputRef.current?.click()}>
                <Upload size={15} /> {uploading ? 'Preparing photo…' : photo.isSample ? 'Use my photo' : 'Change photo'}
              </button>
              <span className="sg-photo-name" role="status">
                {photo.isSample ? 'JPG, PNG or WebP · Up to 20 MB' : `Your photo · ${photo.name}`}
              </span>
            </div>
            {uploadError && <p className="sg-error" role="alert">{uploadError}</p>}

            <fieldset className="sg-fieldset">
              <legend>01 <span>Choose your print size</span></legend>
              <div className="sg-size-grid">
                {GUIDE_SIZES.map(option => (
                  <button
                    key={option.id}
                    className={sizeId === option.id ? 'selected' : ''}
                    aria-pressed={sizeId === option.id}
                    onClick={() => setSizeId(option.id)}
                  >
                    <strong>{option.id === '12x18' ? '12 × 18″' : option.id}</strong>
                    <small>{getGuideDimensions(option, orientation, unit)}</small>
                    {sizeId === option.id && <Check size={12} />}
                  </button>
                ))}
              </div>
              <div className="sg-unit-line">
                <span>Print dimensions</span>
                <div role="group" aria-label="Measurement units">
                  <button aria-pressed={unit === 'cm'} onClick={() => setUnit('cm')}>cm</button>
                  <button aria-pressed={unit === 'in'} onClick={() => setUnit('in')}>inches</button>
                </div>
              </div>
            </fieldset>

            <fieldset className="sg-fieldset">
              <legend>02 <span>Choose your orientation</span></legend>
              <div className="sg-orientation-options">
                <button aria-pressed={orientation === 'portrait'} onClick={() => setOrientation('portrait')}>
                  <span className="sg-orientation-icon" /> Portrait
                </button>
                <button aria-pressed={orientation === 'landscape'} onClick={() => setOrientation('landscape')}>
                  <span className="sg-orientation-icon landscape" /> Landscape
                </button>
              </div>
            </fieldset>

            <fieldset className="sg-fieldset">
              <legend>03 <span>Find your frame finish</span></legend>
              <div className="sg-frame-grid">
                {FRAME_FINISHES.map(option => (
                  <button
                    key={option.id}
                    className={frameId === option.id ? 'selected' : ''}
                    aria-pressed={frameId === option.id}
                    onClick={() => setFrameId(option.id)}
                    title={option.finish}
                    aria-label={`Choose ${option.name}`}
                  >
                    <FramedPosterPreview poster={poster} frame={homeFrame(option.id)} orientation={orientation} />
                    <span>{option.name.replace('Regal ', '')}</span>
                    {frameId === option.id && <Check size={11} />}
                  </button>
                ))}
              </div>
              <p className="sg-frame-description">{frame.name} · {frame.finish}</p>
              <a className="sg-mobile-preview" href="#room-preview"><Expand size={14} /> See this frame in your room <ArrowUpRight size={14} /></a>
            </fieldset>

            <div className="sg-size-recommendation">
              <Ruler size={19} />
              <div><strong>{size.label}</strong><p>{size.use}.</p></div>
            </div>
            <button className="sg-primary" disabled={uploading} onClick={continueToStudio}>
              Create with this size & frame <ArrowRight size={17} />
            </button>
            <p className="sg-handoff-note">Your size, orientation, frame and photo follow you into the studio.</p>
          </aside>
        </div>

        <section className="sg-comparison" id="size-comparison" aria-labelledby="sg-comparison-title">
          <div className="sg-section-heading">
            <div><span className="sg-eyebrow">THE SIZE GUIDE, AT A GLANCE</span><h2 id="sg-comparison-title">Small keepsake or statement piece?</h2></div>
            <p>Select a size here to update your room preview.</p>
          </div>
          <div className="sg-table-scroll">
            <table>
              <caption className="sg-sr-only">Compare print sizes, dimensions and suggested placement</caption>
              <thead><tr><th scope="col">Print size</th><th scope="col">Centimetres</th><th scope="col">Inches</th><th scope="col">A good place to start</th></tr></thead>
              <tbody>
                {GUIDE_SIZES.map(option => (
                  <tr key={option.id} className={sizeId === option.id ? 'selected' : ''}>
                    <th scope="row"><button aria-pressed={sizeId === option.id} onClick={() => setSizeId(option.id)}>{option.id === '12x18' ? '12 × 18″' : option.id}{sizeId === option.id && <Check size={13} />}</button></th>
                    <td>{getGuideDimensions(option, orientation)}</td>
                    <td>{getGuideDimensions(option, orientation, 'in')}</td>
                    <td>{option.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sg-measuring-tip"><Ruler size={18} /><p><strong>Before you order</strong> Mark the selected print dimensions on your wall with removable tape. Leave extra room for the frame and mount.</p><Link to="/contact">Ask the studio <ArrowUpRight size={15} /></Link></div>
        </section>
      </div>

      <dialog
        ref={dialogRef}
        className="sg-inspect-dialog"
        aria-label="Selected frame close-up"
        onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}
      >
        <button className="sg-dialog-close" onClick={() => dialogRef.current?.close()} aria-label="Close frame close-up"><X size={22} /></button>
        <div className="sg-dialog-frame"><FramedPosterPreview poster={poster} frame={frame} orientation={orientation} /></div>
        <p>{frame.name} · {dimensions} · {photo.isSample ? 'Sample photo' : photo.name}</p>
      </dialog>
    </div>
  );
}

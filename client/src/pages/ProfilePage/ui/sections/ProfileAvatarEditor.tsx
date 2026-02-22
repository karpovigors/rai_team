import React from 'react';

interface CropRect {
  x: number;
  y: number;
  size: number;
}

interface ProfileAvatarEditorProps {
  username: string;
  displayAvatar: string;
  sourceImage: string | null;
  crop: CropRect;
  imageDisplaySize: { width: number; height: number };
  isDragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  imageRef: React.RefObject<HTMLImageElement>;
  onDragOverChange: (isDragOver: boolean) => void;
  onImageFile: (file: File | null) => void;
  onImageLoad: () => void;
  onCropStart: (e: React.PointerEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onClearNewImage: () => void;
  onRemoveAvatar: () => void;
  onEditCurrentAvatar: () => void;
  onCropSizeChange: (value: number) => void;
}

export const ProfileAvatarEditor: React.FC<ProfileAvatarEditorProps> = ({
  username,
  displayAvatar,
  sourceImage,
  crop,
  imageDisplaySize,
  isDragOver,
  fileInputRef,
  imageRef,
  onDragOverChange,
  onImageFile,
  onImageLoad,
  onCropStart,
  onDrop,
  onClearNewImage,
  onRemoveAvatar,
  onEditCurrentAvatar,
  onCropSizeChange,
}) => (
  <div className="profile-avatar-block">
    <div className="profile-avatar-preview">
      {displayAvatar ? (
        <img src={displayAvatar} alt="Аватар" />
      ) : (
        <div className="profile-avatar-fallback">{(username || '?').slice(0, 1).toUpperCase()}</div>
      )}
    </div>

    <div
      className={`profile-dropzone ${isDragOver ? 'is-drag-over' : ''}`}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOverChange(true);
      }}
      onDragLeave={() => onDragOverChange(false)}
      onDrop={onDrop}
    >
      Перетащите фото сюда или нажмите, чтобы выбрать
    </div>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="profile-hidden-input"
      onChange={(e) => onImageFile(e.target.files?.[0] || null)}
    />

    {sourceImage && (
      <div className="profile-cropper-block">
        <p className="profile-crop-hint">Перетащите круг, чтобы выбрать область аватара</p>
        <div className="profile-crop-stage">
          <img
            ref={imageRef}
            src={sourceImage}
            alt="Кадрирование"
            className="profile-crop-image"
            onLoad={onImageLoad}
          />
          <div
            className="profile-crop-circle"
            style={{
              left: `${crop.x}px`,
              top: `${crop.y}px`,
              width: `${crop.size}px`,
              height: `${crop.size}px`,
            }}
            onPointerDown={onCropStart}
          />
        </div>

        <label className="profile-size-control">
          Размер области
          <input
            type="range"
            min={80}
            max={Math.max(120, Math.floor(Math.min(imageDisplaySize.width || 120, imageDisplaySize.height || 120)))}
            value={Math.round(crop.size)}
            onChange={(e) => onCropSizeChange(Number(e.target.value))}
          />
        </label>
      </div>
    )}

    <div className="profile-avatar-actions">
      {sourceImage && (
        <button type="button" className="profile-secondary-button" onClick={onClearNewImage}>
          Убрать новое фото
        </button>
      )}
      {displayAvatar && (
        <button type="button" className="profile-secondary-button danger" onClick={onRemoveAvatar}>
          Удалить аватар
        </button>
      )}
      {displayAvatar && !sourceImage && (
        <button type="button" className="profile-secondary-button" onClick={onEditCurrentAvatar}>
          Редактировать текущий аватар
        </button>
      )}
    </div>
  </div>
);

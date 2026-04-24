import { useState } from 'react';
import styled from 'styled-components';
import type { CreateRoutePayload, RoutePoint } from '../types';

const Card = styled.section`
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 18px;
  display: grid;
  gap: 14px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 767px) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  background: var(--surface-muted);
`;

const Textarea = styled.textarea`
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  background: var(--surface-muted);
  min-height: 90px;
  resize: vertical;
`;

const Label = styled.label`
  display: grid;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 0.92rem;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  border: none;
  border-radius: 11px;
  padding: 10px 12px;
  cursor: pointer;
  background: var(--accent);
  color: white;
  font-weight: 700;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const GhostButton = styled(Button)`
  background: var(--surface-muted);
  color: var(--text-secondary);
  border: 1px solid var(--line);
`;

const PointCard = styled.div`
  border: 1px dashed var(--line);
  border-radius: 12px;
  padding: 10px;
`;

const Photos = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Thumb = styled.img`
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 10px;
`;

const createDefaultPoint = (): RoutePoint => ({ lat: 55.751244, lng: 37.618423, name: '' });

interface Props {
  busy: boolean;
  onUploadPhoto: (file: File) => Promise<string>;
  onSubmit: (payload: CreateRoutePayload) => Promise<void>;
}

export const RouteForm = ({ busy, onUploadPhoto, onSubmit }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState<RoutePoint[]>([createDefaultPoint(), createDefaultPoint()]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const updatePoint = (index: number, patch: Partial<RoutePoint>) => {
    setPoints((current) => current.map((point, pointIndex) => (pointIndex === index ? { ...point, ...patch } : point)));
  };

  const addPoint = () => setPoints((current) => [...current, createDefaultPoint()]);
  const removePoint = (index: number) =>
    setPoints((current) => current.filter((_, pointIndex) => pointIndex !== index));

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    setUploading(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => onUploadPhoto(file)));
      setPhotos((current) => [...current, ...uploaded]);
    } catch (error) {
      setFormError((error as Error).message || 'Ошибка загрузки фото');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (title.trim().length < 3) {
      setFormError('Название должно содержать минимум 3 символа');
      return;
    }

    if (points.length < 2) {
      setFormError('Добавьте минимум 2 точки маршрута');
      return;
    }

    const validPoints = points.every((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
    if (!validPoints) {
      setFormError('Проверьте координаты точек маршрута');
      return;
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      points,
      photos,
    });

    setTitle('');
    setDescription('');
    setPoints([createDefaultPoint(), createDefaultPoint()]);
    setPhotos([]);
  };

  return (
    <Card>
      <h2 style={{ margin: 0 }}>Создать маршрут</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <Label>
          Название
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например: Тропа у озера" />
        </Label>

        <Label>
          Описание
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Кратко расскажите о маршруте"
          />
        </Label>

        <div>
          <div style={{ marginBottom: 8, color: 'var(--text-secondary)' }}>Точки маршрута</div>
          {points.map((point, index) => (
            <PointCard key={`${index}-${point.lat}-${point.lng}`}>
              <Row>
                <Label style={{ gridColumn: 'span 4' }}>
                  Название точки
                  <Input
                    value={point.name || ''}
                    onChange={(event) => updatePoint(index, { name: event.target.value })}
                    placeholder={`Точка ${index + 1}`}
                  />
                </Label>
                <Label style={{ gridColumn: 'span 3' }}>
                  Latitude
                  <Input
                    type="number"
                    step="any"
                    value={point.lat}
                    onChange={(event) => updatePoint(index, { lat: Number(event.target.value) })}
                  />
                </Label>
                <Label style={{ gridColumn: 'span 3' }}>
                  Longitude
                  <Input
                    type="number"
                    step="any"
                    value={point.lng}
                    onChange={(event) => updatePoint(index, { lng: Number(event.target.value) })}
                  />
                </Label>
                <div style={{ gridColumn: 'span 2', alignSelf: 'end' }}>
                  <GhostButton
                    type="button"
                    onClick={() => removePoint(index)}
                    disabled={points.length <= 2 || busy || uploading}
                  >
                    Удалить
                  </GhostButton>
                </div>
              </Row>
            </PointCard>
          ))}
          <GhostButton type="button" onClick={addPoint} disabled={busy || uploading}>
            + Добавить точку
          </GhostButton>
        </div>

        <Label>
          Фото маршрута
          <Input type="file" accept="image/*" multiple onChange={(event) => void handlePhotoUpload(event.target.files)} />
        </Label>

        {photos.length > 0 && (
          <Photos>
            {photos.map((photo) => (
              <Thumb key={photo} src={photo} alt="Загруженное фото" />
            ))}
          </Photos>
        )}

        {formError && <div style={{ color: 'var(--danger)' }}>{formError}</div>}

        <ActionRow>
          <Button type="submit" disabled={busy || uploading}>
            {busy ? 'Сохранение...' : 'Опубликовать маршрут'}
          </Button>
          {uploading && <span style={{ color: 'var(--text-secondary)' }}>Загрузка фото...</span>}
        </ActionRow>
      </form>
    </Card>
  );
};

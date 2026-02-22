import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BuildingsPage.css';
import authService from '../../../services/authService';
import { AppHeader } from '../../../widgets/AppHeader/ui/AppHeader';
import { useProfileActions } from '../../../widgets/ProfileMenu/model/useProfileActions';
import { createBuilding } from '../api/buildingsApi';
import { useBuildings } from '../model/useBuildings';
import { useBuildingsView } from '../model/lib/useBuildingsView';
import { BuildingsFilters } from './sections/BuildingsFilters';
import { BuildingsList } from './sections/BuildingsList';
import { AddBuildingForm } from './sections/AddBuildingForm';
import { BuildingsProfileModal } from './overlays/BuildingsProfileModal';

export const BuildingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInfrastructureType, setSelectedInfrastructureType] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const { buildings, isLoading, loadError, reload } = useBuildings();
  const [addTitle, setAddTitle] = useState('');
  const [addInfrastructureType, setAddInfrastructureType] = useState('');
  const [addSchedule, setAddSchedule] = useState('');
  const [addAddress, setAddAddress] = useState('');
  const [addMetros, setAddMetros] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addLatitude, setAddLatitude] = useState('');
  const [addLongitude, setAddLongitude] = useState('');
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addSignLanguage, setAddSignLanguage] = useState(false);
  const [addSubtitles, setAddSubtitles] = useState(false);
  const [addRamps, setAddRamps] = useState(false);
  const [addBraille, setAddBraille] = useState(false);
  const [addError, setAddError] = useState('');
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  const isModerator = authService.isModerator();
  const username = authService.getUsername();
  const { infrastructureTypes, filteredBuildings } = useBuildingsView({
    buildings,
    searchQuery,
    selectedInfrastructureType,
  });

  const { handleLoginClick, handleLogoutClick, handleProfileClick } = useProfileActions({
    setIsProfileModalOpen,
  });

  const handleToggleAddForm = () => {
    setAddImageFile(null);
    setIsAddFormOpen((prev) => !prev);
  };

  const handleAddBuilding = (e: React.FormEvent) => {
    void (async () => {
      e.preventDefault();
      setAddError('');

      if (!addTitle.trim() || !addAddress.trim()) {
        setAddError('Заполните обязательные поля: название и адрес');
        return;
      }

      setIsSubmittingAdd(true);
      try {
        await createBuilding({
          title: addTitle,
          infrastructureType: addInfrastructureType,
          schedule: addSchedule,
          address: addAddress,
          metros: addMetros,
          description: addDescription,
          signLanguage: addSignLanguage,
          subtitles: addSubtitles,
          ramps: addRamps,
          braille: addBraille,
          latitude: addLatitude,
          longitude: addLongitude,
          imageFile: addImageFile,
        });
        setAddTitle('');
        setAddInfrastructureType('');
        setAddSchedule('');
        setAddAddress('');
        setAddMetros('');
        setAddDescription('');
        setAddLatitude('');
        setAddLongitude('');
        setAddImageFile(null);
        setAddSignLanguage(false);
        setAddSubtitles(false);
        setAddRamps(false);
        setAddBraille(false);
        setIsAddFormOpen(false);
        await reload();
      } catch (error: unknown) {
        if (error instanceof Error) {
          setAddError(error.message);
        } else {
          setAddError('Не удалось добавить объект');
        }
      } finally {
        setIsSubmittingAdd(false);
      }
    })();
  };

  return (
    <div className="buildings-page">
      <AppHeader
        onOpenMap={() => navigate('/map-admin')}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />
      <main className="buildings-main">
        <BuildingsFilters
          searchQuery={searchQuery}
          selectedInfrastructureType={selectedInfrastructureType}
          infrastructureTypes={infrastructureTypes}
          isModerator={isModerator}
          isAddFormOpen={isAddFormOpen}
          onSearchQueryChange={setSearchQuery}
          onInfrastructureTypeChange={setSelectedInfrastructureType}
          onToggleAddForm={handleToggleAddForm}
        />
        {isModerator && isAddFormOpen && (
          <AddBuildingForm
            title={addTitle}
            infrastructureType={addInfrastructureType}
            schedule={addSchedule}
            address={addAddress}
            metros={addMetros}
            description={addDescription}
            latitude={addLatitude}
            longitude={addLongitude}
            signLanguage={addSignLanguage}
            subtitles={addSubtitles}
            ramps={addRamps}
            braille={addBraille}
            addError={addError}
            isSubmitting={isSubmittingAdd}
            onTitleChange={setAddTitle}
            onInfrastructureTypeChange={setAddInfrastructureType}
            onScheduleChange={setAddSchedule}
            onAddressChange={setAddAddress}
            onMetrosChange={setAddMetros}
            onDescriptionChange={setAddDescription}
            onLatitudeChange={setAddLatitude}
            onLongitudeChange={setAddLongitude}
            onSignLanguageChange={setAddSignLanguage}
            onSubtitlesChange={setAddSubtitles}
            onRampsChange={setAddRamps}
            onBrailleChange={setAddBraille}
            onImageChange={setAddImageFile}
            onSubmit={handleAddBuilding}
          />
        )}
        <BuildingsList
          buildings={filteredBuildings}
          isLoading={isLoading}
          loadError={loadError}
        />
      </main>
      <footer className="buildings-footer"></footer>

      <BuildingsProfileModal
        isOpen={isProfileModalOpen}
        isAuthenticated={isAuthenticated}
        username={username}
        onClose={() => setIsProfileModalOpen(false)}
        onLogin={handleLoginClick}
        onProfile={handleProfileClick}
        onLogout={handleLogoutClick}
      />
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { SystemSettings } from '../../types';
import SaveBar from '../SaveBar';

const AdminSystemSettingsTab: React.FC = () => {
    const { data, setData } = useAppContext();
    
    const [draftSettings, setDraftSettings] = useState<SystemSettings>(data.settings);
    const [initialSettings, setInitialSettings] = useState<SystemSettings>(data.settings);

    useEffect(() => {
        setDraftSettings(data.settings);
        setInitialSettings(data.settings);
    }, [data.settings]);

    const isDirty = useMemo(() => JSON.stringify(draftSettings) !== JSON.stringify(initialSettings), [draftSettings, initialSettings]);

    const handleInputChange = (field: keyof SystemSettings, value: number) => {
        setDraftSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleLevelChange = (level: keyof SystemSettings['defaultAttainmentLevels'], value: number) => {
        setDraftSettings(prev => ({
            ...prev,
            defaultAttainmentLevels: { ...prev.defaultAttainmentLevels, [level]: value }
        }));
    };

    const handleWeightChange = (type: 'direct' | 'indirect', value: number) => {
        if (value < 0 || value > 100) return;
        setDraftSettings(prev => ({
            ...prev,
            defaultWeights: {
                direct: type === 'direct' ? value : 100 - value,
                indirect: type === 'indirect' ? value : 100 - value,
            }
        }));
    };

    const handleSave = () => {
        setData(prev => ({ ...prev, settings: draftSettings }));
        setInitialSettings(draftSettings);
        alert('System settings saved successfully!');
    };

    const handleCancel = () => {
        setDraftSettings(initialSettings);
    };

    return (
        <div className="space-y-8 pb-20">
            <h2 className="text-xl font-semibold text-gray-700">Default System Settings</h2>
            
            <div className="space-y-4 max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Default CO Attainment Target (%)</label>
                    <input
                        type="number"
                        value={draftSettings.defaultCoTarget}
                        onChange={e => handleInputChange('defaultCoTarget', parseInt(e.target.value))}
                        className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-gray-700">Default Attainment Level Thresholds</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Level 3 (&ge; X % of students)</label>
                        <input
                            type="number"
                            value={draftSettings.defaultAttainmentLevels.level3}
                            onChange={e => handleLevelChange('level3', parseInt(e.target.value))}
                            className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Level 2 (&ge; Y % of students)</label>
                        <input
                            type="number"
                            value={draftSettings.defaultAttainmentLevels.level2}
                            onChange={e => handleLevelChange('level2', parseInt(e.target.value))}
                            className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Level 1 (&ge; Z % of students)</label>
                        <input
                            type="number"
                            value={draftSettings.defaultAttainmentLevels.level1}
                            onChange={e => handleLevelChange('level1', parseInt(e.target.value))}
                            className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-gray-700">Default Direct/Indirect Attainment Weights</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Direct Weight (%)</label>
                        <input
                            type="number"
                            value={draftSettings.defaultWeights.direct}
                            onChange={e => handleWeightChange('direct', parseInt(e.target.value))}
                            className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Indirect Weight (%)</label>
                        <input
                            type="number"
                            value={draftSettings.defaultWeights.indirect}
                            onChange={e => handleWeightChange('indirect', parseInt(e.target.value))}
                            className="mt-1 w-full p-2 border bg-white text-gray-900 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
};

export default AdminSystemSettingsTab;
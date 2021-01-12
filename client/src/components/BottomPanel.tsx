import { Drawer, IconButton } from '@material-ui/core';
import { ITowerDefenseState, PanelItemEnum } from '../types';
import { IImagesState } from './BackgroundPanel';
import AnimationPanel from './AnimationPanel';
import BackgroundPanel from './BackgroundPanel';
import { Chat } from './Chat';
import { Gifs } from './Gifs';
import { IGif } from '@giphy/js-types';
import React, { useState } from 'react';
import { SettingsPanel } from './SettingsPanel';
import SoundPanel from './SoundPanel';
import { TowerDefensePanel } from './TowerDefensePanel';
import { Weather } from './Weather';
import WhiteboardPanel from './WhiteboardPanel';

export interface IPanelProps {
	bottomPanelRef: React.RefObject<HTMLDivElement>;
	isOpen: boolean;
	type?: PanelItemEnum;
	setBrushColor: (color: string) => void;
	onAction: (key: string, ...args: any[]) => void;
	towerDefenseState: ITowerDefenseState;
	updateIsTyping: (isTyping: boolean) => void;
}

export interface IPanelContentProps {
	type?: PanelItemEnum;
	setBrushColor: (color: string) => void;
	onAction: (key: string, ...args: any[]) => void;
	towerDefenseState: ITowerDefenseState;
	updateIsTyping: (isTyping: boolean) => void;
	images: IImagesState[];
	setImages: React.Dispatch<React.SetStateAction<IImagesState[]>>;
}

export interface ISoundPairs {
	icon: string;
	type: string;
	category: string;
}

const emojiList: string[] = ['😍', '😎', '👏', '👀', '✨', '🎅'];

export const BottomPanel = ({
	bottomPanelRef,
	isOpen,
	type,
	setBrushColor,
	onAction,
	towerDefenseState,
	updateIsTyping
}: IPanelProps) => {
	const [images, setImages] = useState<IImagesState[]>([]);

	return (
		<Drawer variant="persistent" anchor="bottom" open={isOpen}>
			<div ref={bottomPanelRef} className="bottom-panel-container">
				<PanelContent
					type={type}
					setBrushColor={setBrushColor}
					onAction={onAction}
					towerDefenseState={towerDefenseState}
					updateIsTyping={updateIsTyping}
					images={images}
					setImages={setImages}
				/>
			</div>
		</Drawer>
	);
};

const PanelContent = ({
	type,
	setBrushColor,
	onAction,
	towerDefenseState,
	updateIsTyping,
	images,
	setImages
}: IPanelContentProps) => {
	switch (type) {
		case 'emoji':
			return (
				<>
					{emojiList.map((emoji) => (
						<div key={emoji} className="bottom-panel-emoji">
							<IconButton onClick={() => onAction('emoji', emoji)}>
								{emoji}
							</IconButton>
						</div>
					))}
				</>
			);

		case 'chat':
			return (
				<Chat
					sendMessage={(message) => {
						onAction('chat', message);
					}}
					updateIsTyping={updateIsTyping}
				/>
			);
		case 'sound':
			return <SoundPanel sendSound={onAction} />;

		case 'gifs':
			return (
				<Gifs
					sendGif={(gif: IGif) => {
						onAction('gif', gif.id);
					}}
				/>
			);
		case 'tower':
			return (
				<TowerDefensePanel
					isStarted={towerDefenseState.isPlaying}
					gold={towerDefenseState.gold}
					onStart={() =>
						onAction('tower defense', {
							key: 'tower defense',
							value: 'start'
						})
					}
					onSelectTower={(towerValue: string) =>
						onAction('tower defense', {
							key: 'tower defense',
							value: 'select tower',
							tower: towerValue
						})
					}
				/>
			);
		case 'background':
			return (
				<BackgroundPanel
					sendImage={(name, type) => onAction(type, name)}
					setImages={setImages}
					images={images}
				/>
			);
		case 'animation':
			return <AnimationPanel sendAnimation={onAction} />;
		case 'whiteboard':
			return <WhiteboardPanel setBrushColor={setBrushColor} />;
		case 'settings':
			return (
				<SettingsPanel
					onSubmitUrl={(url) => onAction('settings', 'url', url)}
					onChangeName={(name) => onAction('settings', 'name', name)}
				/>
			);
		case 'weather':
			return (
				<Weather sendLocation={(location) => onAction('weather', location)} />
			);
		default:
			return null;
	}
};

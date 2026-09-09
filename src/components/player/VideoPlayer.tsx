import { isHLSProvider, MediaPlayer, MediaProvider } from '@vidstack/react';
import Hls from 'hls.js';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { PlayerControls } from './PlayerControls';

export const DEFAULT_PLAYER_API_KEY = '8d80584f02d604759a5fad01db47f2e488de412cb6cb5237';
export const DEFAULT_ALICEEGE_API_KEY = DEFAULT_PLAYER_API_KEY;

export interface VideoPlayerProps {
	source: string;
	title: string;
	poster?: string;
	autoPlay?: boolean;
	muted?: boolean;
	apiKey?: string;
}

export function VideoPlayer({
	source,
	title,
	poster,
	autoPlay = false,
	muted = false,
}: VideoPlayerProps) {
	const [playbackError, setPlaybackError] = useState(false);
	const [playbackAttempt, setPlaybackAttempt] = useState(0);
	const handlePlaybackError = useCallback(() => setPlaybackError(true), []);
	const handleRetry = useCallback(() => {
		setPlaybackAttempt((attempt) => attempt + 1);
		setPlaybackError(false);
	}, []);
	const handleProviderChange = useCallback(
		(provider: unknown) => configureHlsProvider(provider),
		[],
	);

	useEffect(() => {
		setPlaybackAttempt(0);
		setPlaybackError(false);
	}, [source]);

	if (playbackError) {
		return (
			<main className='playerState playerStateError' aria-live='assertive'>
				<div className='playerStateIcon' aria-hidden='true'>
					<TriangleAlert size={28} strokeWidth={1.8} />
				</div>
				<h1>Поток не открылся</h1>
				<p>Проверьте playback URL и доступность partner server.</p>
				<button type='button' className='retryButton' onClick={handleRetry}>
					<RefreshCw size={17} aria-hidden='true' />
					Повторить
				</button>
			</main>
		);
	}

	return (
		<MediaPlayer
			key={`${source}:${playbackAttempt}`}
			className='player'
			src={{ src: source, type: 'application/vnd.apple.mpegurl' }}
			title={title}
			poster={poster}
			playsInline
			load='eager'
			posterLoad='eager'
			preferNativeHLS={false}
			keyTarget='player'
			controlsDelay={2200}
			autoPlay={autoPlay}
			muted={muted}
			onProviderChange={handleProviderChange}
			onError={handlePlaybackError}
		>
			<MediaProvider />
			<PlayerControls title={title} />
		</MediaPlayer>
	);
}

function configureHlsProvider(provider: unknown) {
	if (!isHLSProvider(provider)) {
		return;
	}

	provider.library = Hls;
}

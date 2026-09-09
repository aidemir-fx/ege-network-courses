import { Settings } from 'lucide-react';
import { useEffect } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import {
	AUTO_PLAY,
	MUTED,
	PLAYBACK_URL,
	VIDEO_POSTER,
	VIDEO_TITLE,
} from './config';

export function App() {
	const configurationError = getConfigurationError();

	useEffect(() => {
		document.title = `${VIDEO_TITLE} — AliceEge Player`;
	}, []);

	if (configurationError) {
		return (
			<main className='playerState playerStateError' aria-live='assertive'>
				<div className='playerStateIcon' aria-hidden='true'>
					<Settings size={28} strokeWidth={1.8} />
				</div>
				<h1>Плеер не настроен</h1>
				<p>{configurationError}</p>
			</main>
		);
	}

	return (
		<VideoPlayer
			source={PLAYBACK_URL}
			title={VIDEO_TITLE}
			poster={VIDEO_POSTER}
			autoPlay={AUTO_PLAY}
			muted={MUTED}
		/>
	);
}

function getConfigurationError() {
	if (!PLAYBACK_URL.trim()) {
		return 'Укажите PLAYBACK_URL в src/config.ts.';
	}

	if (PLAYBACK_URL.startsWith('/')) {
		return null;
	}

	try {
		const playbackUrl = new URL(PLAYBACK_URL);
		if (playbackUrl.protocol !== 'http:' && playbackUrl.protocol !== 'https:') {
			return 'PLAYBACK_URL должен использовать HTTP или HTTPS.';
		}
	} catch {
		return 'PLAYBACK_URL должен быть same-origin путём или абсолютным HTTP(S) URL.';
	}

	return null;
}

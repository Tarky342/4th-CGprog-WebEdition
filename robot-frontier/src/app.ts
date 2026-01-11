// src/app.ts
import './styles.css'; // Assuming you have a CSS file for styles
import { initializeGame } from './game'; // Import your game initialization logic

// アプリケーションのエントリーポイント
function main() {
    const canvas = document.getElementById('c') as HTMLCanvasElement;
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
        console.error('Failed to get canvas context');
        return;
    }

    // ゲームの初期化
    initializeGame(canvas, context);
}

// DOMが完全に読み込まれた後にmain関数を呼び出す
document.addEventListener('DOMContentLoaded', main);
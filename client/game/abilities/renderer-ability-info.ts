export class RendererAbilityInfo {
    private static abilityNumber = 1;
    static render(containerId: string, text: string) {
        const info = document.createElement('div');
        info.innerText = `${this.abilityNumber++} - ${text}`;
        const header = document.createElement('div');
        header.innerText = 'Ваши способности:';

        const container = document.getElementById(containerId);
        container?.appendChild(header);
        container?.appendChild(info);
    }

    static reset(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        this.abilityNumber = 1;
    }
}

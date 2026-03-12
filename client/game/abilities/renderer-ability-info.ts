export class RendererAbilityInfo {
    private static abilityNumber = 1;
    static render(containerId: string, text: string) {
        const container = document.getElementById(containerId);

        if (this.abilityNumber === 1) {
            const header = document.createElement('div');
            header.innerText = 'Ваши способности:';
            container?.appendChild(header);
        }

        const info = document.createElement('div');
        info.innerText = `${this.abilityNumber++} - ${text}`;
        container?.appendChild(info);
    }

    static reset(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        this.abilityNumber = 1;
    }
}

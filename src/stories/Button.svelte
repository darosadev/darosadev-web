<script lang="ts">
  import './button.css';
  import { Button } from "$lib/components/ui/button/index.ts";
  
  interface Props {
    /** Button contents */
    label: string;
    /** The onclick event handler */
    onclick?: () => void;
  }

  const { label, ...props }: Props = $props();
</script>

<Button>
  {label}
</Button>

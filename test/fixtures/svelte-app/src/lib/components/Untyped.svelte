<script>
  let { label, size = "md", ...rest } = $props();
</script>

<span class={size} {...rest}>{label}</span>

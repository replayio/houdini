<script context="module" lang="ts">
  import { browser } from '$app/env';
  import { GQL_Hello, GQL_usersList } from '$houdini';
</script>

<script lang="ts">
  $: browser && GQL_usersList.fetch();
  $: browser && GQL_Hello.fetch();
</script>

<h1>NETWORK</h1>

<ul>
  {#each $GQL_usersList.data?.usersList ?? [] as user}
    <li>
      {user.id} - {user.name}
    </li>
  {/each}
</ul>

<div id="result">
  {$GQL_Hello.data?.hello}
</div>

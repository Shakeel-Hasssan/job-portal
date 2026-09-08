import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How this website handles visitor information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-neutral-900">Privacy policy</h1>

      <div className="mt-6 space-y-6 text-neutral-700">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Information collected
          </h2>
          <p className="mt-2">
            Visitors can browse this site without creating an account, and the
            site does not ask visitors for personal information. Administrator
            accounts exist for staff who publish listings; those accounts store an
            email address and an authentication session cookie.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">Cookies</h2>
          <p className="mt-2">
            A session cookie is set only when an administrator signs in. It keeps
            that person logged in and is removed when they sign out.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">External links</h2>
          <p className="mt-2">
            Job listings link to employers&apos; own websites. Once you follow one
            of those links you are on a site we do not control, governed by that
            site&apos;s privacy policy. Anything you submit there is received by
            the employer, not by us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            Service providers
          </h2>
          <p className="mt-2">
            The site is hosted on Cloudflare and stores its data with Supabase.
            Each provider processes technical information such as IP addresses in
            order to serve requests.
          </p>
        </section>
      </div>

      <p className="mt-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        This is placeholder wording, not legal advice, and it makes no claim of
        compliance with any particular law. Have it reviewed and adapted to your
        jurisdiction and your actual data practices before launch — particularly
        if you later add analytics or advertising.
      </p>
    </main>
  );
}
